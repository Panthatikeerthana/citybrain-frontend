import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  User, 
  Sparkles, 
  HelpCircle, 
  Car, 
  AlertTriangle, 
  Droplets, 
  Trash2, 
  Wind, 
  ShieldAlert,
  ArrowRight,
  Info
} from 'lucide-react';
import { useCityBrain } from '../context/CityBrainContext';
import { DataSourceBadge } from '../components/common/DataSourceBadge';
import { AssistantMessage } from '../types';

export const AssistantPage: React.FC = () => {
  const { 
    traffic, 
    emergencies, 
    waterIssues, 
    wasteRecords, 
    pollutionRecords, 
    weather, 
    riskPredictions,
    complaints 
  } = useCityBrain();

  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<AssistantMessage[]>([
    {
      id: 'msg-1',
      sender: 'assistant',
      content: 'Hello! I am the City Brain Urban Intelligence Assistant. I analyze real-time and simulated telemetry across traffic nodes, emergency dispatches, water networks, air quality sensors, and citizen reports in Greater Hyderabad. How can I assist your operations today?',
      timestamp: 'Just now',
      suggestedFollowups: [
        'Which location has the highest traffic congestion?',
        'Show all critical emergency incidents',
        'Are there any water pipeline leakages reported?',
        'What is the current air quality and weather status?',
        'Summarize active predictive urban risks'
      ],
    }
  ]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Query engine that extracts structured insights from live/demo state
  const processQuery = (query: string): { response: string; followups: string[] } => {
    const q = query.toLowerCase();

    // 1. Highest traffic congestion
    if (q.includes('traffic') || q.includes('congestion') || q.includes('highest')) {
      const sorted = [...traffic].sort((a, b) => b.congestion - a.congestion);
      const top = sorted[0] || { location: 'Hitec City', congestion: 85, vehicles: 4500, speedKmh: 12 };
      const second = sorted[1] || { location: 'LB Nagar', congestion: 78, vehicles: 3900 };
      return {
        response: `Based on active telemetry, **${top.location}** currently reports the highest congestion at **${top.congestion}%** with approximately **${top.vehicles.toLocaleString()} vehicles/hr** (Speed: ~${top.speedKmh || 12} km/h). \n\nNext most congested node: **${second.location}** at **${second.congestion}%** (${second.vehicles.toLocaleString()} vehicles/hr).`,
        followups: [
          'What is the traffic congestion at LB Nagar?',
          'What is the traffic congestion at Uppal?',
          'Show active emergency incidents'
        ]
      };
    }

    // 2. Specific traffic junction check
    if (q.includes('uppal') || q.includes('ghatkesar') || q.includes('lb nagar') || q.includes('kukatpally') || q.includes('jodimetla')) {
      const locMatch = traffic.find(t => q.includes(t.location.toLowerCase().split(' ')[0]));
      if (locMatch) {
        return {
          response: `**${locMatch.location} Traffic Status:**\n- Congestion Index: **${locMatch.congestion}%**\n- Volume: **${locMatch.vehicles.toLocaleString()} vehicles/hr**\n- Status: **${locMatch.status}**\n- Flow Speed: **~${locMatch.speedKmh || 20} km/h**\n- Telemetry Mode: ${locMatch.isLive ? 'Live Spring Boot /api/traffic' : 'Verified Hyderabad Demo Dataset'}`,
          followups: ['Which location has highest traffic?', 'Show active risk predictions']
        };
      }
    }

    // 3. Emergency incidents
    if (q.includes('emergency') || q.includes('incident') || q.includes('critical') || q.includes('accident') || q.includes('fire')) {
      const critical = emergencies.filter(e => e.severity === 'Critical' || e.severity === 'High');
      const list = critical.map(e => `- **[${e.severity}] ${e.title}** at ${e.location} (Status: ${e.status}, Responders: ${e.respondersAssigned.join(', ')})`).join('\n');
      return {
        response: `There are currently **${critical.length} High/Critical incidents** requiring immediate operational oversight:\n\n${list}`,
        followups: [
          'Show details on the LB Nagar flyover incident',
          'Which location has highest traffic?',
          'Are there any water leakages?'
        ]
      };
    }

    // 4. Water leaks & water supply
    if (q.includes('water') || q.includes('leak') || q.includes('pipeline') || q.includes('pressure')) {
      const leaks = waterIssues.filter(w => w.issueType === 'Pipeline Leakage');
      const text = waterIssues.map(w => `- **${w.issueType}** at ${w.location} (${w.affectedHouseholds} households, Pressure: ${w.pressurePsi} PSI, Status: ${w.status})`).join('\n');
      return {
        response: `Active water network telemetry reveals **${waterIssues.length} issues** across the municipal grid (${leaks.length} confirmed pipeline leaks):\n\n${text}`,
        followups: [
          'What is the current weather status?',
          'What waste bins are overflowing?'
        ]
      };
    }

    // 5. Waste & sanitation
    if (q.includes('waste') || q.includes('garbage') || q.includes('bin') || q.includes('overflow')) {
      const overflowing = wasteRecords.filter(w => w.fillPercentage >= 85);
      const text = overflowing.map(w => `- **${w.location}**: Bin is **${w.fillPercentage}% full** (Priority: ${w.priority}, Assigned: ${w.vehicleAssigned || 'Unassigned'})`).join('\n');
      return {
        response: `Solid waste monitoring flags **${overflowing.length} bins overflowing or near capacity (≥85%)**:\n\n${text}`,
        followups: [
          'Show citizen complaints list',
          'What is the overall city risk score?'
        ]
      };
    }

    // 6. Air quality & Pollution
    if (q.includes('pollution') || q.includes('aqi') || q.includes('air quality') || q.includes('pm2.5')) {
      const highest = [...pollutionRecords].sort((a, b) => b.aqi - a.aqi)[0] || { stationName: 'Sanathnagar Industrial Sector', aqi: 182, dominantPollutant: 'PM2.5', pm25: 88 };
      return {
        response: `Simulated ambient air telemetry indicates an average city AQI of **127 (Moderate)**.\n- Worst Station: **${highest.stationName}** at **AQI ${highest.aqi}** (Dominant pollutant: ${highest.dominantPollutant}, PM2.5: ${highest.pm25} µg/m³).\n- Cleanest Sector: **University of Hyderabad Eco Station** at **AQI 48 (Good)**.\n\n*Note: Simulated regional indicators for urban planning.*`,
        followups: [
          'What is the rainfall forecast?',
          'Which location has highest traffic?'
        ]
      };
    }

    // 7. Weather status
    if (q.includes('weather') || q.includes('rain') || q.includes('temperature') || q.includes('forecast')) {
      return {
        response: `**Current Meteorological Status for Greater Hyderabad:**\n- Temperature: **${weather.temperature || 31.4}°C** (Feels like ${weather.feelsLike || 34.2}°C)\n- Condition: **${weather.condition || 'Partly Cloudy'}**\n- Humidity: **${weather.humidity || 68}%**\n- 24h Cumulative Rainfall: **${weather.rainfall || 14.5} mm** (Heavy shower peak anticipated around 18:00)`,
        followups: [
          'Are there any waterlogging risks?',
          'Which location has highest traffic?'
        ]
      };
    }

    // 8. Citizen Complaints
    if (q.includes('complaint') || q.includes('grievance') || q.includes('citizen')) {
      return {
        response: `Currently **${complaints.length} citizen grievances** are registered in the local demonstration database. \n- Categories: Road/Potholes (${complaints.filter(c => c.category === 'Road & Potholes').length}), Drainage (${complaints.filter(c => c.category === 'Drainage').length}), Streetlights (${complaints.filter(c => c.category === 'Streetlight').length}).\n- Resolved: ${complaints.filter(c => c.status === 'Resolved').length}`,
        followups: [
          'How do I submit a new complaint?',
          'Show predictive risks'
        ]
      };
    }

    // 9. Risk prediction overview
    if (q.includes('risk') || q.includes('predict') || q.includes('rule') || q.includes('forecast risk')) {
      const list = riskPredictions.map(r => `- **[Score ${r.riskScore}/100] ${r.title}** (${r.location}) — *Action:* ${r.recommendedAction}`).join('\n');
      return {
        response: `City Brain's rule-based predictive engine has flagged **${riskPredictions.length} impending risks**:\n\n${list}`,
        followups: [
          'Which location has highest traffic?',
          'Show emergency incidents'
        ]
      };
    }

    // Default graceful fallback
    return {
      response: `I can query and correlate data across all City Brain modules in Greater Hyderabad, including **Traffic saturation**, **Emergency dispatches**, **Water leakages**, **Solid waste accumulation**, **Air quality (AQI)**, **Weather forecasts**, and **Predictive risk matrices**.\n\nPlease ask about any of these domains or click one of the suggested inquiries below.`,
      followups: [
        'Which location has the highest traffic congestion?',
        'Show all critical emergency incidents',
        'What is the current air quality and weather status?',
        'Summarize active predictive urban risks'
      ]
    };
  };

  const handleSendMessage = (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim()) return;

    const userMsg: AssistantMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Simulate natural processing delay
    setTimeout(() => {
      const { response, followups } = processQuery(query);
      const assistantMsg: AssistantMessage = {
        id: `ast-${Date.now()}`,
        sender: 'assistant',
        content: response,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedFollowups: followups,
      };
      setMessages(prev => [...prev, assistantMsg]);
      setIsTyping(false);
    }, 600);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-[#E1E7E2] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-[#202B29] tracking-tight flex items-center gap-2">
              <Bot className="w-6 h-6 text-[#188568]" />
              <span>City Brain AI Operations Assistant</span>
            </h1>
            <DataSourceBadge source="rule-based" />
          </div>
          <p className="text-xs sm:text-sm text-[#697773] mt-1">
            Internal telemetry reasoning engine assisting command operators with instant multi-domain queries and analysis.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-[#188568] bg-[#188568]/10 border border-[#188568]/20 px-3 py-1.5 rounded-lg shrink-0">
          <Sparkles className="w-4 h-4 text-[#188568]" />
          <span>Local Telemetry Semantic Engine</span>
        </div>
      </div>

      {/* Main Chat Container */}
      <div className="bg-white rounded-xl border border-[#E1E7E2] shadow-sm overflow-hidden flex flex-col h-[640px]">
        {/* Chat History */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 max-w-3xl ${
                msg.sender === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
              }`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-1 ${
                  msg.sender === 'user'
                    ? 'bg-[#188568] text-white'
                    : 'bg-[#173D35] text-white'
                }`}
              >
                {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              {/* Message Bubble */}
              <div className="space-y-2">
                <div
                  className={`p-4 rounded-xl text-xs sm:text-sm leading-relaxed border ${
                    msg.sender === 'user'
                      ? 'bg-[#188568] border-[#188568] text-white rounded-tr-none shadow-sm'
                      : 'bg-[#F7F8F5] border-[#E1E7E2] text-[#202B29] rounded-tl-none shadow-sm'
                  }`}
                >
                  <div className="whitespace-pre-line font-sans">{msg.content}</div>
                  <div
                    className={`text-[10px] font-mono mt-2 pt-1 border-t ${
                      msg.sender === 'user' ? 'border-white/20 text-white/80 text-right' : 'border-[#E1E7E2] text-[#697773]'
                    }`}
                  >
                    {msg.timestamp}
                  </div>
                </div>

                {/* Suggested Followups */}
                {msg.suggestedFollowups && msg.suggestedFollowups.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {msg.suggestedFollowups.map((f, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendMessage(f)}
                        className="px-3 py-1 bg-white hover:bg-[#F7F8F5] border border-[#E1E7E2] hover:border-[#188568]/40 rounded-full text-xs text-[#202B29] hover:text-[#188568] transition-all font-sans text-left shadow-sm"
                      >
                        💡 {f}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex gap-3 max-w-xl mr-auto animate-fadeIn">
              <div className="w-8 h-8 rounded-lg bg-[#173D35] text-white flex items-center justify-center shrink-0 mt-1">
                <Bot className="w-4 h-4 animate-pulse" />
              </div>
              <div className="p-3.5 bg-[#F7F8F5] border border-[#E1E7E2] rounded-xl rounded-tl-none flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#188568] animate-bounce"></span>
                <span className="w-2 h-2 rounded-full bg-[#188568] animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-2 h-2 rounded-full bg-[#188568] animate-bounce [animation-delay:0.4s]"></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-[#F7F8F5] border-t border-[#E1E7E2]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Ask City Brain about traffic, flood risks, air quality, or emergencies..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 bg-white border border-[#E1E7E2] rounded-lg px-4 py-3 text-xs sm:text-sm text-[#202B29] placeholder-[#697773] outline-none focus:border-[#188568] transition-all font-sans"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className={`p-3 rounded-lg transition-all ${
                input.trim()
                  ? 'bg-[#188568] hover:bg-[#11654F] text-white font-bold cursor-pointer shadow-sm'
                  : 'bg-[#E1E7E2] text-[#697773] cursor-not-allowed'
              }`}
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          <div className="text-[11px] text-[#697773] font-mono text-center mt-2">
            City Brain Internal Urban Analytics Engine • Queries live data in context
          </div>
        </div>
      </div>
    </div>
  );
};

