import { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Send, Phone, Headphones, Bike } from 'lucide-react';
import { useApp } from '@/context';

interface Message {
  id: string;
  sender: 'me' | 'support' | 'driver';
  text: string;
  time: string;
}

export function MessagesPage() {
  const { setPage, orders } = useApp();
  const [messages, setMessages] = useState<Message[]>([
    { id: 'm1', sender: 'support', text: "Bonjour ! Comment pouvons-nous vous aider aujourd'hui ?", time: '10:30' },
    { id: 'm2', sender: 'me', text: 'Bonjour, je voulais savoir où en est ma commande CMD-2026-0142', time: '10:31' },
    { id: 'm3', sender: 'support', text: 'Votre commande est actuellement en route. Le livreur Ibrahim Traoré arrive vers vous.', time: '10:32' },
  ]);
  const [input, setInput] = useState('');
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = () => {
    if (!input.trim()) return;
    const now = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    setMessages((prev) => [...prev, { id: `m${Date.now()}`, sender: 'me', text: input, time: now }]);
    setInput('');
    setTimeout(() => {
      setMessages((prev) => [...prev, { id: `m${Date.now() + 1}`, sender: 'support', text: 'Merci pour votre message. Un membre de notre équipe vous répondra dans les plus brefs délais.', time: now }]);
    }, 1200);
  };

  const activeOrder = orders.find((o) => o.driverName);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 animate-slide-up flex flex-col" style={{ minHeight: 'calc(100vh - 140px)' }}>
      <button onClick={() => setPage('home')} className="btn-ghost mb-4 flex items-center gap-1 self-start">
        <ArrowLeft size={18} /> Accueil
      </button>

      <div className="card flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-gray-100 flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-orange-100 flex items-center justify-center">
            <Headphones size={22} className="text-orange-600" />
          </div>
          <div className="flex-1">
            <h1 className="font-bold text-navy-900">Support CourseCI</h1>
            <p className="text-xs text-success-600 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-success-500" /> En ligne
            </p>
          </div>
          <button className="p-2.5 rounded-xl bg-navy-50 hover:bg-navy-100 text-navy-700">
            <Phone size={20} />
          </button>
        </div>

        {/* Active driver */}
        {activeOrder && activeOrder.driverName && (
          <div className="p-3 bg-orange-50/50 border-b border-orange-100 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-orange-100 flex items-center justify-center">
              <Bike size={18} className="text-orange-600" />
            </div>
            <div className="flex-1 text-sm">
              <span className="text-gray-500">Livreur assigné: </span>
              <span className="font-bold text-navy-900">{activeOrder.driverName}</span>
            </div>
            <button className="text-sm text-orange-600 font-semibold">Contacter</button>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                msg.sender === 'me'
                  ? 'bg-orange-500 text-white rounded-br-md'
                  : 'bg-gray-100 text-navy-800 rounded-bl-md'
              }`}>
                <p className="text-sm">{msg.text}</p>
                <p className={`text-xs mt-1 ${msg.sender === 'me' ? 'text-orange-100' : 'text-gray-400'}`}>{msg.time}</p>
              </div>
            </div>
          ))}
          <div ref={endRef} />
        </div>

        {/* Input */}
        <div className="p-3 border-t border-gray-100 flex gap-2">
          <input
            className="input-field flex-1"
            placeholder="Écrivez votre message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && send()}
          />
          <button onClick={send} disabled={!input.trim()} className="btn-primary px-4">
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
