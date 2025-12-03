import React, { useState, useEffect } from 'react';
import { generateMissions, getEncouragement } from './services/geminiService';
import { Mission, Tab, Theme, UserState, Sticker, FeedPost } from './types';
import Navigation from './components/Navigation';
import Header from './components/Header';
import { CheckCircle2, Lock, Sparkles, RefreshCw, X, ShoppingBag } from 'lucide-react';

// --- Constants & Data ---

const INITIAL_THEMES: Theme[] = [
  {
    id: 'default',
    name: '기본 (Blue)',
    primaryColor: 'bg-blue-500',
    secondaryColor: 'bg-blue-50',
    accentColor: 'text-blue-600',
    backgroundColor: 'bg-gray-50',
    price: 0,
    description: "깔끔하고 시원한 기본 테마",
    unlocked: true
  },
  {
    id: 'sakura',
    name: '봄날의 벚꽃',
    primaryColor: 'bg-pink-400',
    secondaryColor: 'bg-pink-50',
    accentColor: 'text-pink-500',
    backgroundColor: 'bg-rose-50',
    price: 300,
    description: "따뜻하고 포근한 느낌을 줍니다",
    unlocked: false
  },
  {
    id: 'forest',
    name: '새벽 숲',
    primaryColor: 'bg-emerald-600',
    secondaryColor: 'bg-emerald-50',
    accentColor: 'text-emerald-700',
    backgroundColor: 'bg-stone-50',
    price: 500,
    description: "눈이 편안해지는 자연의 색",
    unlocked: false
  },
  {
    id: 'night',
    name: '고요한 밤',
    primaryColor: 'bg-indigo-600',
    secondaryColor: 'bg-indigo-50',
    accentColor: 'text-indigo-400',
    backgroundColor: 'bg-slate-900',
    price: 800,
    description: "차분하게 집중할 수 있는 다크 모드 스타일",
    unlocked: false
  }
];

const INITIAL_STICKERS: Sticker[] = [
  { id: 'cat', name: '고양이', emoji: '🐱', price: 100, unlocked: false, description: "귀여운 고양이 친구" },
  { id: 'plant', name: '화분', emoji: '🪴', price: 150, unlocked: false, description: "무럭무럭 자라나요" },
  { id: 'star', name: '별', emoji: '⭐', price: 200, unlocked: false, description: "반짝이는 성취" },
  { id: 'trophy', name: '트로피', emoji: '🏆', price: 500, unlocked: false, description: "당신은 챔피언" },
];

const MOCK_FEED: FeedPost[] = [
  { id: '1', username: '익명의 부엉이', reflection: '상쾌했어요!', content: '오늘 아침 햇살 받으며 5분 걷기 성공! 기분이 한결 낫네요.', likes: 12, missionTitle: '햇빛 보며 5분 걷기', timestamp: '10분 전' },
  { id: '2', username: '용기낸 토끼', reflection: '떨렸지만 눈 딱 감고 인사했어요.', content: '정말 용기 있는 행동이었어요! 멋집니다.', likes: 25, missionTitle: '점원에게 인사하기', timestamp: '1시간 전' },
  { id: '3', username: '느긋한 거북이', content: '깔끔해진 책상을 보니 마음이 편안해져요.', likes: 8, missionTitle: '책상 정리하기', timestamp: '2시간 전' },
];

// --- Main Component ---

export default function App() {
  // State
  const [currentTab, setCurrentTab] = useState<Tab>('home');
  const [userState, setUserState] = useState<UserState>({
    credits: 100, // Starting credits
    streak: 1,
    completedMissionsCount: 0,
    activeThemeId: 'default',
    unlockedThemes: ['default'],
    unlockedStickers: []
  });

  const [availableMissions, setAvailableMissions] = useState<Mission[]>([]);
  const [activeMissions, setActiveMissions] = useState<Mission[]>([]);
  const [feed, setFeed] = useState<FeedPost[]>(MOCK_FEED);
  const [isLoadingMissions, setIsLoadingMissions] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Verification Modal State
  const [verifyingMission, setVerifyingMission] = useState<Mission | null>(null);
  const [reflection, setReflection] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  // Derived State
  const activeTheme = INITIAL_THEMES.find(t => t.id === userState.activeThemeId) || INITIAL_THEMES[0];
  const isDarkMode = activeTheme.id === 'night';
  const textColor = isDarkMode ? 'text-white' : 'text-gray-900';
  const subTextColor = isDarkMode ? 'text-gray-300' : 'text-gray-600';
  const cardBg = isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100';

  // Effects
  useEffect(() => {
    // Load initial missions
    handleGenerateMissions();
  }, []);

  // Handlers

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleGenerateMissions = async () => {
    setIsLoadingMissions(true);
    const missions = await generateMissions();
    setAvailableMissions(missions);
    setIsLoadingMissions(false);
  };

  const acceptMission = (mission: Mission) => {
    if (activeMissions.some(m => m.id === mission.id)) {
      showToast("이미 진행 중인 미션입니다.");
      return;
    }
    setActiveMissions([...activeMissions, mission]);
    setAvailableMissions(prev => prev.filter(m => m.id !== mission.id));
    setCurrentTab('home');
    showToast("미션을 수락했습니다! 홈에서 확인하세요.");
  };

  const handleCompleteClick = (mission: Mission) => {
    setVerifyingMission(mission);
    setReflection("");
  };

  const confirmCompletion = async () => {
    if (!verifyingMission) return;
    
    setIsVerifying(true);
    
    // AI Encouragement based on reflection
    const encouragement = await getEncouragement(verifyingMission.title, reflection);
    
    setUserState(prev => ({
      ...prev,
      credits: prev.credits + verifyingMission.credits,
      completedMissionsCount: prev.completedMissionsCount + 1
    }));

    setActiveMissions(prev => prev.filter(m => m.id !== verifyingMission.id));
    
    // Add to feed
    const newPost: FeedPost = {
      id: Date.now().toString(),
      username: '나 (Me)',
      reflection: reflection,
      content: encouragement,
      likes: 0,
      missionTitle: verifyingMission.title,
      timestamp: '방금 전'
    };
    setFeed([newPost, ...feed]);
    
    showToast(`미션 성공! +${verifyingMission.credits}C 획득.`);
    
    setIsVerifying(false);
    setVerifyingMission(null);
  };

  const buyTheme = (theme: Theme) => {
    if (userState.credits < theme.price) {
      showToast("크레딧이 부족합니다.");
      return;
    }
    setUserState(prev => ({
      ...prev,
      credits: prev.credits - theme.price,
      unlockedThemes: [...prev.unlockedThemes, theme.id]
    }));
    showToast(`${theme.name} 테마를 구매했습니다!`);
  };

  const applyTheme = (themeId: string) => {
    setUserState(prev => ({ ...prev, activeThemeId: themeId }));
    showToast("테마가 적용되었습니다.");
  };

  const buySticker = (sticker: Sticker) => {
    if (userState.credits < sticker.price) {
      showToast("크레딧이 부족합니다.");
      return;
    }
    setUserState(prev => ({
      ...prev,
      credits: prev.credits - sticker.price,
      unlockedStickers: [...prev.unlockedStickers, sticker.id]
    }));
    showToast("스티커를 구매했습니다!");
  };

  // --- Views ---

  const renderHome = () => (
    <div className="flex flex-col gap-6 p-4 pb-24 animate-fade-in">
      <div className={`${activeTheme.primaryColor} rounded-3xl p-6 text-white shadow-lg relative overflow-hidden transition-colors duration-500`}>
        <div className="relative z-10">
          <h2 className="text-2xl font-bold mb-2">오늘의 여정</h2>
          <p className="opacity-90 text-sm mb-4">작은 성공이 모여 큰 변화를 만듭니다.</p>
          <div className="flex items-end gap-2">
             <span className="text-4xl font-bold">{userState.completedMissionsCount}</span>
             <span className="mb-1.5 opacity-80">개의 미션 완료</span>
          </div>
        </div>
        {/* Decorate with stickers */}
        <div className="absolute right-0 bottom-0 p-4 flex gap-2 flex-wrap justify-end max-w-[70%] opacity-90 pointer-events-none">
           {userState.unlockedStickers.map((sid, idx) => {
             const s = INITIAL_STICKERS.find(is => is.id === sid);
             return <span key={`${sid}-${idx}`} className="text-4xl drop-shadow-md animate-bounce-slight" style={{animationDelay: `${idx*0.1}s`}}>{s?.emoji}</span>
           })}
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <h3 className={`font-bold text-lg ${textColor}`}>진행 중인 미션</h3>
        {activeMissions.length === 0 ? (
          <div className={`text-center py-10 border-2 border-dashed rounded-2xl ${isDarkMode ? 'border-slate-700 text-slate-500' : 'border-gray-200 text-gray-400'}`}>
            <p>현재 진행 중인 미션이 없습니다.</p>
            <button 
              onClick={() => setCurrentTab('missions')}
              className={`mt-4 px-4 py-2 rounded-full text-sm font-medium ${activeTheme.secondaryColor} ${activeTheme.accentColor} transition-colors`}
            >
              새 미션 받기
            </button>
          </div>
        ) : (
          activeMissions.map(mission => (
            <div key={mission.id} className={`${cardBg} p-5 rounded-2xl shadow-sm border transition-all`}>
              <div className="flex justify-between items-start mb-3">
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${activeTheme.secondaryColor} ${activeTheme.accentColor}`}>
                  {mission.category}
                </span>
                <span className={`text-xs font-bold text-yellow-500`}>+{mission.credits} C</span>
              </div>
              <h4 className={`font-bold text-lg mb-1 ${textColor}`}>{mission.title}</h4>
              <p className={`text-sm ${subTextColor} mb-4`}>{mission.description}</p>
              <button 
                onClick={() => handleCompleteClick(mission)}
                className={`w-full py-3 rounded-xl font-bold text-white shadow-md active:scale-95 transition-all flex items-center justify-center gap-2 ${activeTheme.primaryColor} hover:opacity-90`}
              >
                <CheckCircle2 size={18} />
                완료 인증하기
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const renderMissions = () => (
    <div className="flex flex-col gap-6 p-4 pb-24 animate-fade-in">
       <div className="flex justify-between items-center">
         <h2 className={`text-xl font-bold ${textColor}`}>추천 미션</h2>
         <button 
           onClick={handleGenerateMissions}
           disabled={isLoadingMissions}
           className={`p-2 rounded-full ${isDarkMode ? 'bg-slate-800' : 'bg-white'} shadow-sm border border-gray-100 disabled:opacity-50 hover:bg-gray-50 transition-colors`}
         >
           <RefreshCw size={20} className={`${activeTheme.accentColor} ${isLoadingMissions ? 'animate-spin' : ''}`} />
         </button>
       </div>

       {isLoadingMissions ? (
         <div className="flex flex-col items-center justify-center py-20 gap-4">
           <div className={`w-10 h-10 border-4 border-t-transparent rounded-full animate-spin ${activeTheme.accentColor.replace('text', 'border')}`}></div>
           <p className={`text-sm ${subTextColor}`}>AI가 맞춤형 미션을 생각 중이에요...</p>
         </div>
       ) : (
         <div className="grid gap-4">
           {availableMissions.map(mission => (
             <div key={mission.id} className={`${cardBg} p-5 rounded-2xl shadow-sm border relative overflow-hidden group hover:shadow-md transition-all`}>
               <div className="flex justify-between items-start">
                 <div>
                   <h4 className={`font-bold text-lg ${textColor}`}>{mission.title}</h4>
                   <p className={`text-xs mt-1 ${subTextColor}`}>{mission.difficulty.toUpperCase()} • {mission.category}</p>
                 </div>
                 <div className="bg-yellow-50 px-2 py-1 rounded text-yellow-600 text-xs font-bold">
                   +{mission.credits} C
                 </div>
               </div>
               <p className={`text-sm ${subTextColor} mt-3 mb-4 leading-relaxed`}>{mission.description}</p>
               <button 
                 onClick={() => acceptMission(mission)}
                 className={`w-full py-2.5 rounded-xl font-medium border-2 transition-colors ${
                   isDarkMode ? 'border-slate-600 text-slate-300 hover:bg-slate-700' : 'border-gray-100 text-gray-600 hover:bg-gray-50'
                 }`}
               >
                 도전하기
               </button>
             </div>
           ))}
         </div>
       )}
    </div>
  );

  const renderSocial = () => (
    <div className="flex flex-col gap-4 p-4 pb-24 animate-fade-in">
       <h2 className={`text-xl font-bold ${textColor}`}>응원 브릿지</h2>
       <p className={`text-sm ${subTextColor} -mt-2 mb-2`}>익명으로 서로의 작은 성공을 축하해주세요.</p>

       <div className="space-y-4">
         {feed.map(post => (
           <div key={post.id} className={`${cardBg} p-4 rounded-2xl shadow-sm border transition-all`}>
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${['bg-orange-400', 'bg-blue-400', 'bg-purple-400', 'bg-green-400'][Math.floor(Math.random()*4)]}`}>
                  {post.username[0]}
                </div>
                <div>
                  <p className={`text-sm font-bold ${textColor}`}>{post.username}</p>
                  <p className={`text-[10px] ${subTextColor}`}>{post.timestamp}</p>
                </div>
              </div>
              
              <div className={`text-xs inline-block px-2 py-0.5 rounded mb-3 ${activeTheme.secondaryColor} ${activeTheme.accentColor}`}>
                미션: {post.missionTitle}
              </div>

              {post.reflection && (
                <div className={`mb-3 p-3 rounded-xl text-sm italic ${isDarkMode ? 'bg-slate-700 text-slate-200' : 'bg-gray-50 text-gray-700'}`}>
                  "{post.reflection}"
                </div>
              )}
              
              <div className="flex gap-2 items-start">
                 <div className="mt-1"><Sparkles size={14} className="text-yellow-400 fill-yellow-400" /></div>
                 <p className={`text-sm ${textColor} font-medium`}>{post.content}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-end">
                 <button className="flex items-center gap-1.5 text-gray-400 hover:text-red-400 transition-colors text-xs font-bold">
                   <span>❤️</span>
                   <span>{post.likes} 응원</span>
                 </button>
              </div>
           </div>
         ))}
       </div>
    </div>
  );

  const renderShop = () => (
    <div className="flex flex-col gap-6 p-4 pb-24 animate-fade-in">
      <div className={`${activeTheme.primaryColor} text-white p-6 rounded-3xl shadow-lg flex justify-between items-center transition-colors duration-500`}>
         <div>
           <p className="opacity-80 text-sm">내 지갑</p>
           <p className="text-3xl font-bold">{userState.credits.toLocaleString()} C</p>
         </div>
         <ShoppingBag size={40} className="opacity-50" />
      </div>

      <div>
        <h3 className={`font-bold text-lg mb-4 ${textColor}`}>앱 테마</h3>
        <div className="grid grid-cols-1 gap-4">
          {INITIAL_THEMES.map(theme => {
            const isUnlocked = userState.unlockedThemes.includes(theme.id);
            const isActive = userState.activeThemeId === theme.id;
            
            return (
              <div key={theme.id} className={`${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100'} p-4 rounded-2xl border shadow-sm flex items-center gap-4 transition-transform active:scale-[0.99]`}>
                <div className={`w-12 h-12 rounded-full ${theme.primaryColor} shadow-md shrink-0`}></div>
                <div className="flex-1">
                  <h4 className={`font-bold ${textColor}`}>{theme.name}</h4>
                  <p className={`text-xs ${subTextColor}`}>{theme.description}</p>
                </div>
                <div className="text-right">
                  {isActive ? (
                    <span className={`text-xs font-bold px-3 py-1.5 rounded-full bg-gray-100 text-gray-500`}>사용 중</span>
                  ) : isUnlocked ? (
                    <button 
                      onClick={() => applyTheme(theme.id)}
                      className={`text-xs font-bold px-3 py-1.5 rounded-full ${activeTheme.primaryColor} text-white shadow-sm hover:opacity-90`}
                    >
                      적용하기
                    </button>
                  ) : (
                    <button 
                      onClick={() => buyTheme(theme)}
                      className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-full bg-yellow-100 text-yellow-700 hover:bg-yellow-200 transition-colors"
                    >
                      {theme.price} C <Lock size={12} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <h3 className={`font-bold text-lg mb-4 ${textColor}`}>스티커 (홈 화면 꾸미기)</h3>
        <div className="grid grid-cols-2 gap-3">
          {INITIAL_STICKERS.map(sticker => {
             const isUnlocked = userState.unlockedStickers.includes(sticker.id);
             return (
               <button 
                key={sticker.id}
                onClick={() => !isUnlocked && buySticker(sticker)}
                disabled={isUnlocked}
                className={`p-4 rounded-2xl border ${cardBg} flex flex-col items-center justify-center gap-2 relative overflow-hidden transition-all ${!isUnlocked ? 'hover:shadow-md active:scale-95' : 'opacity-80'}`}
               >
                 <span className="text-4xl filter drop-shadow-sm">{sticker.emoji}</span>
                 <span className={`text-sm font-medium ${textColor}`}>{sticker.name}</span>
                 {isUnlocked ? (
                   <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">보유중</span>
                 ) : (
                   <span className="text-xs font-bold text-yellow-600 bg-yellow-50 px-2 py-1 rounded-full flex items-center gap-1">
                     {sticker.price} C
                   </span>
                 )}
               </button>
             )
          })}
        </div>
      </div>
    </div>
  );

  // Verification Modal
  const renderVerificationModal = () => {
    if (!verifyingMission) return null;
    
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
        <div className={`${cardBg} w-full max-w-sm rounded-3xl p-6 shadow-2xl animate-fade-in-up`}>
           <div className="flex justify-between items-center mb-4">
             <h3 className={`text-lg font-bold ${textColor}`}>미션 완료 인증</h3>
             <button onClick={() => setVerifyingMission(null)} className="p-1 rounded-full hover:bg-gray-100 transition-colors">
               <X size={20} className="text-gray-400" />
             </button>
           </div>
           
           <div className="mb-6">
             <p className={`text-sm ${subTextColor} mb-2`}>미션: <span className={`font-bold ${activeTheme.accentColor}`}>{verifyingMission.title}</span></p>
             <label className={`block text-sm font-medium ${textColor} mb-2`}>
               기분이 어떠셨나요? (선택사항)
             </label>
             <textarea 
               value={reflection}
               onChange={(e) => setReflection(e.target.value)}
               placeholder="잠깐이라도 상쾌했어요..."
               className={`w-full p-3 rounded-xl border ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gray-50 border-gray-200'} focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none h-24 text-sm`}
             />
           </div>

           <button 
             onClick={confirmCompletion}
             disabled={isVerifying}
             className={`w-full py-3 rounded-xl font-bold text-white shadow-lg flex items-center justify-center gap-2 ${activeTheme.primaryColor} ${isVerifying ? 'opacity-70' : 'hover:opacity-90 active:scale-95'} transition-all`}
           >
             {isVerifying ? (
               <RefreshCw size={18} className="animate-spin" />
             ) : (
               <>
                 <CheckCircle2 size={18} />
                 <span>완료하고 {verifyingMission.credits}C 받기</span>
               </>
             )}
           </button>
        </div>
      </div>
    );
  };

  return (
    <div className={`w-full h-full flex flex-col ${activeTheme.backgroundColor} transition-colors duration-500 overflow-hidden`}>
      <Header credits={userState.credits} theme={activeTheme} />
      
      <main className="flex-1 overflow-y-auto pt-14 overscroll-contain">
        {currentTab === 'home' && renderHome()}
        {currentTab === 'missions' && renderMissions()}
        {currentTab === 'social' && renderSocial()}
        {currentTab === 'shop' && renderShop()}
      </main>

      <Navigation currentTab={currentTab} setTab={setCurrentTab} theme={activeTheme} />
      
      {renderVerificationModal()}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-gray-900/90 text-white px-6 py-3 rounded-full shadow-xl z-[100] animate-fade-in-up flex items-center gap-2">
           <Sparkles size={16} className="text-yellow-300" />
           <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out forwards;
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
           animation: fade-in-up 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes bounce-slight {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        .animate-bounce-slight {
          animation: bounce-slight 2s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
}