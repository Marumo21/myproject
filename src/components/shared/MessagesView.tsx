import { useState, useEffect } from 'react';
import { Send, Search, ArrowLeft } from 'lucide-react';
import { supabase, Profile, Message } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

export function MessagesView() {
  const { user, profile } = useAuth();
  const [conversations, setConversations] = useState<Profile[]>([]);
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchConversations();
    }
  }, [user]);

  useEffect(() => {
    if (selectedUser && user) {
      fetchMessages(selectedUser.id);

      const subscription = supabase
        .channel('messages_changes')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
          },
          (payload) => {
            const newMsg = payload.new as Message;
            if (
              (newMsg.sender_id === user.id && newMsg.receiver_id === selectedUser.id) ||
              (newMsg.sender_id === selectedUser.id && newMsg.receiver_id === user.id)
            ) {
              fetchMessages(selectedUser.id);
            }
          }
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [selectedUser, user]);

  const fetchConversations = async () => {
    if (!user) return;

    const { data: sentMessages } = await supabase
      .from('messages')
      .select('receiver_id')
      .eq('sender_id', user.id);

    const { data: receivedMessages } = await supabase
      .from('messages')
      .select('sender_id')
      .eq('receiver_id', user.id);

    const userIds = new Set([
      ...(sentMessages?.map((m) => m.receiver_id) || []),
      ...(receivedMessages?.map((m) => m.sender_id) || []),
    ]);

    if (userIds.size > 0) {
      const { data: users } = await supabase
        .from('profiles')
        .select('*')
        .in('id', Array.from(userIds));

      if (users) {
        setConversations(users);
      }
    }

    setLoading(false);
  };

  const fetchMessages = async (otherUserId: string) => {
    if (!user) return;

    const { data } = await supabase
      .from('messages')
      .select('*')
      .or(`and(sender_id.eq.${user.id},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${user.id})`)
      .order('created_at', { ascending: true });

    if (data) {
      setMessages(data);

      await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('receiver_id', user.id)
        .eq('sender_id', otherUserId)
        .eq('is_read', false);
    }
  };

  const sendMessage = async () => {
    if (!user || !selectedUser || !newMessage.trim()) return;

    const { error } = await supabase.from('messages').insert({
      sender_id: user.id,
      receiver_id: selectedUser.id,
      content: newMessage.trim(),
    });

    if (!error) {
      await supabase.from('notifications').insert({
        user_id: selectedUser.id,
        type: 'message',
        title: 'New Message',
        content: `You have a new message from ${profile?.full_name}`,
      });

      setNewMessage('');
      fetchMessages(selectedUser.id);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getAvatarColor = (id: string) => {
    const colors = ['bg-red-500', 'bg-green-500', 'bg-blue-500', 'bg-purple-500', 'bg-yellow-500', 'bg-pink-500'];
    const index = id.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const filteredConversations = conversations.filter((conv) =>
    conv.full_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-600">Loading messages...</div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-6 h-[calc(100vh-180px)]">
      <div className="col-span-1 bg-white rounded-2xl shadow-sm flex flex-col">
        <div className="p-4 border-b">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Messages</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-50 border-none focus:ring-2 focus:ring-cyan-500 text-sm"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredConversations.length === 0 ? (
            <div className="p-6 text-center text-gray-500 text-sm">
              No conversations yet
            </div>
          ) : (
            filteredConversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setSelectedUser(conv)}
                className={`w-full p-4 flex items-center gap-3 hover:bg-gray-50 transition-colors border-b ${
                  selectedUser?.id === conv.id ? 'bg-cyan-50' : ''
                }`}
              >
                <div className={`w-12 h-12 rounded-full ${getAvatarColor(conv.id)} flex items-center justify-center text-white font-semibold`}>
                  {getInitials(conv.full_name)}
                </div>
                <div className="flex-1 text-left">
                  <div className="font-medium text-gray-900">{conv.full_name}</div>
                  <div className="text-sm text-gray-600">{conv.user_type}</div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      <div className="col-span-2 bg-white rounded-2xl shadow-sm flex flex-col">
        {selectedUser ? (
          <>
            <div className="p-4 border-b flex items-center gap-3">
              <button
                onClick={() => setSelectedUser(null)}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className={`w-10 h-10 rounded-full ${getAvatarColor(selectedUser.id)} flex items-center justify-center text-white font-semibold`}>
                {getInitials(selectedUser.full_name)}
              </div>
              <div>
                <div className="font-semibold text-gray-900">{selectedUser.full_name}</div>
                <div className="text-sm text-gray-600">{selectedUser.email}</div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => {
                const isSent = message.sender_id === user?.id;
                return (
                  <div key={message.id} className={`flex ${isSent ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-xs px-4 py-2 rounded-2xl ${
                        isSent ? 'bg-cyan-500 text-white' : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p className={`text-xs mt-1 ${isSent ? 'text-cyan-100' : 'text-gray-500'}`}>
                        {new Date(message.created_at).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-4 border-t">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2 rounded-lg bg-gray-50 border-none focus:ring-2 focus:ring-cyan-500"
                />
                <button
                  onClick={sendMessage}
                  disabled={!newMessage.trim()}
                  className="p-2 rounded-lg bg-cyan-500 hover:bg-cyan-600 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            Select a conversation to start messaging
          </div>
        )}
      </div>
    </div>
  );
}
