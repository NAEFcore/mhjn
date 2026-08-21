import { Article, Reporter, CulturalEvent, IssueCluster, PaperPage } from '../types';

export const REPORTERS: Record<string, Reporter> = {
  kim_yr: {
    id: 'kim_yr',
    name: '김예림',
    title: '문화부 미술·헤리티지 전문기자',
    department: '문화부 미술팀',
    email: 'yerim.kim@kculturejournal.com',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    bio: '국립현대미술관·국립중앙박물관 출입 12년. 전통 백자와 현대 미술의 접점을 탐구합니다.',
    subscriberCount: 38400,
    cheerCount: 4210,
    isSubscribed: false,
  },
  park_cw: {
    id: 'park_cw',
    name: '박찬우',
    title: '문화재·역사 심층취재 데스크',
    department: '문화재 기획취재부',
    email: 'cw.park@kculturejournal.com',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    bio: '국가유산청 전문 출입. 사라져가는 무형유산 장인과 조선왕실 의궤 복원 현장을 기록합니다.',
    subscriberCount: 45900,
    cheerCount: 6890,
    isSubscribed: true,
  },
  lee_sm: {
    id: 'lee_sm',
    name: '이수민',
    title: '공연예술·음악 비평기자',
    department: '예술공연팀',
    email: 'sm.lee@kculturejournal.com',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
    bio: '국악 판소리부터 K-클래식, 현대무용 비평. 예술의 감동을 생생한 활자로 전합니다.',
    subscriberCount: 29100,
    cheerCount: 3150,
    isSubscribed: false,
  },
  choi_jh: {
    id: 'choi_jh',
    name: '최진호',
    title: 'K-컬처·콘텐츠 글로벌 특파원',
    department: '엔터·콘텐츠팀',
    email: 'jh.choi@kculturejournal.com',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    bio: '전 세계로 뻗어가는 K-웨이브와 웹툰, 영화, 한복의 현대적 인문학 코드를 분석합니다.',
    subscriberCount: 51200,
    cheerCount: 8940,
    isSubscribed: false,
  },
  kang_sy: {
    id: 'kang_sy',
    name: '강서윤',
    title: '문화비평 수석논설위원',
    department: '오피니언 데스크',
    email: 'sy.kang@kculturejournal.com',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80',
    bio: '한국 인문학과 전통 미학의 현대적 가치를 논하는 [문화와 삶] 칼럼을 집필하고 있습니다.',
    subscriberCount: 33800,
    cheerCount: 5270,
    isSubscribed: false,
  },
};

export const INITIAL_ARTICLES: Article[] = [
  {
    id: 'art-001',
    category: 'culture_art',
    categoryLabel: '문화·예술',
    subCategory: '미술·전시',
    title: '[단독] "600년 비움의 미학"… 국립중앙박물관, 조선 백자 달항아리 30점 한자리 첫 공개',
    subtitle: '국보·보물급 조선 후기 대표 백자 총집결… 해외 유수 미술관 소장품 7점 국내 귀환 전시',
    summary: '국립중앙박물관이 한미 수교 및 문화유산 교류 140주년을 맞아 대영박물관, 메트로폴리탄 소장 백자를 포함한 조선 달항아리 명작 30점을 역대 최대 규모로 선보인다.',
    content: `조선 후기 선비 정신과 한국 고유의 담백한 조형미를 대표하는 '달항아리(백자대호·白磁大壺)'의 진수가 국립중앙박물관 기획전시실에서 펼쳐진다.

21일 한국문화저널 취재를 종합하면, 국립중앙박물관은 오는 9월부터 '달을 품은 흙, 조선의 마음을 빚다' 특별기획전을 개최한다. 이번 전시는 국보 제309호 백자 달항아리를 비롯해 영국 대영박물관, 미국 메트로폴리탄 미술관, 프랑스 기메 박물관 등에 소장되어 있던 희귀 해외 유물 7점이 80년 만에 고국으로 돌아와 함께 전시되는 사상 첫 프로젝트다.

달항아리는 둥글고 넉넉한 형태가 마치 보름달을 닮았다 하여 붙여진 이름이다. 상부와 하부를 따로 빚은 뒤 이음새를 붙여 가마에서 구워내는 과정에서 미세한 비대칭과 유백색 유약의 자연스러운 흐름이 완성된다.

전시를 총괄 기획한 김예림 큐레이터는 "완벽한 정원이 아니라 손맛이 깃든 자연스러운 부정형의 선(線), 그리고 꾸밈없는 순백의 질감이 오늘날 전 세계 현대 미술가들에게도 지대한 영감을 주고 있다"며 "전시장 조명을 자연광에 가깝게 설계해 관람객이 마치 달빛 아래서 도자기를 마주하는 듯한 명상적 몰입감을 선사할 것"이라고 밝혔다.

특히 이번 전시에서는 달항아리 내부 구조를 고해상도 CT 스캐닝 기술로 복원한 인터랙티브 3D 미디어아트와 장인의 물레 성형 과정을 담은 4K 초고화질 아카이브 영상도 최초로 공개된다.

전시는 9월 1일부터 11월 30일까지 3개월간 이어지며, 관람권 사전 예약은 이달 25일 오전 10시부터 인터파크 및 박물관 공식 홈페이지에서 개시된다.`,
    reporter: REPORTERS.kim_yr,
    publishedAt: '2026.08.21. 08:30',
    updatedAt: '2026.08.21. 09:45',
    views: 184500,
    shares: 3420,
    likes: 4520,
    reactions: {
      info: 1890,
      exciting: 1420,
      empathy: 2310,
      analysis: 620,
      followup: 410,
    },
    imageUrl: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=1200&q=80',
    imageCaption: '▲ 국립중앙박물관에 전시 예정인 18세기 조선 백자 달항아리. 특유의 유백색 빛깔과 자연스러운 원형의 선이 돋보인다. [사진제공=국립중앙박물관]',
    tags: ['달항아리', '국립중앙박물관', '조선백자', '한국미술', '전시회', 'K-헤리티지'],
    sectionPage: '1면 Top',
    isTopHeadline: true,
    isBreaking: false,
    isEditorialPick: true,
    commentsCount: 142,
    badge: '단독',
    aiSummary: [
      '국립중앙박물관에서 국내외 국보·보물급 조선 백자 달항아리 30점 집결 전시 개최',
      '대영박물관·메트로폴리탄 등 해외 소장 희귀 명작 7점 80여 년 만에 고국서 공개',
      '자연광 조명 연출 및 3D CT 스캐닝 미디어아트 등 현대적 전시기법 도입',
    ],
  },
  {
    id: 'art-002',
    category: 'heritage',
    categoryLabel: '전통과 유산',
    subCategory: '무형유산·문화재',
    title: '[속보] 유네스코, "한국 전통 한지(韓紙) 제작기술" 인류무형문화유산 등재 권고 판정',
    subtitle: '천년의 숨결 닥종이… 유네스코 평가기구 "자연과의 조화와 공동체 전승 가치 탁월"',
    summary: '유네스코 무형유산위원회 산하 평가기구가 한국의 한지 제작 전통에 대해 인류무형문화유산 대표목록 등재 권고를 내렸다. 12월 최종 등재가 확실시된다.',
    content: `닥나무 껍질을 벗겨 맑은 물과 잿물로 삶아내고, 외발뜨기로 천 번의 손길을 거쳐 완성되는 '한국의 전통 한지(韓紙) 제작기술'이 유네스코 인류무형문화유산 등재의 최종 관문을 통과했다.

21일 국가유산청에 따르면, 유네스코 무형유산위원회 평가기구는 최근 발표한 심사 결과 보고서에서 한국 정부가 신청한 '한지 제작 전통 지식과 기술 및 문화적 실천'에 대해 '등재 권고(Inscribe)' 판정을 내렸다.

평가기구는 보고서에서 "한지는 닥나무라는 자연 친화적 원료를 사용해 자연과 인간이 유기적으로 공존하는 지혜를 담고 있으며, 마을 단위 협동과 가문 간 비전(秘傳)을 통해 수백 년간 단절 없이 전승된 공동체 문화의 표상"이라고 극찬했다.

특히 로마 교황청 비밀문서고, 프랑스 루브르 박물관 등 세계 유수 기록보존기관에서 서양 고문서와 고대 회화 복원에 한지가 최적의 복원지로 채택되고 있는 점도 높은 평가 요인으로 작용했다.

박찬우 문화재전문기자는 "서양 펄프 종이가 100~200년 만에 산화되는 반면, 알칼리성 잿물로 빚은 한지는 '지천년 견오백(紙千年 絹五百, 종이는 천 년을 가고 비단은 오백 년을 간다)'이라는 말처럼 1000년 이상의 내구성을 자랑한다"고 짚었다.

이번 권고 판정에 따라 오는 12월 파라과이 아순시온에서 열리는 제21차 무형유산위원회 정기총회에서 한지의 정식 등재가 최종 선포될 전망이다. 이로써 한국은 판소리, 씨름, 김장문화, 탈춤 등에 이어 23번째 유네스코 인류무형유산을 보유하게 된다.`,
    reporter: REPORTERS.park_cw,
    publishedAt: '2026.08.21. 09:15',
    updatedAt: '2026.08.21. 09:50',
    views: 142000,
    shares: 2890,
    likes: 3890,
    reactions: {
      info: 1450,
      exciting: 1980,
      empathy: 3120,
      analysis: 410,
      followup: 290,
    },
    imageUrl: 'https://images.unsplash.com/photo-1582738411706-bfc8e691d1c2?auto=format&fit=crop&w=1200&q=80',
    imageCaption: '▲ 경남 무형문화재 한지 장인이 외발뜨기 기법으로 닥나무 섬유질을 고르게 걸러내고 있다. [사진제공=국가유산청]',
    tags: ['한지', '유네스코', '인류무형문화유산', '국가유산청', '전통공예', '지천년견오백'],
    sectionPage: '1면 종합',
    isTopHeadline: false,
    isBreaking: true,
    isEditorialPick: true,
    commentsCount: 98,
    badge: '속보',
    aiSummary: [
      '유네스코 평가기구, 한국의 전통 한지 제작 기술에 대해 인류무형문화유산 등재 권고',
      '자연 원료 활용과 공동체 전승 문화, 1000년 이상 보존력 세계적으로 인정받아',
      '오는 12월 제21차 정기총회서 최종 확정 시 대한민국 23번째 인류무형유산 등재',
    ],
  },
  {
    id: 'art-003',
    category: 'k_culture',
    categoryLabel: 'K-컬처·엔터',
    subCategory: '글로벌 한류·패션',
    title: '밀라노·파리 런웨이 수놓은 갓(Gat)과 도포… "K-헤리티지가 하이엔드 패션 심장 흔들다"',
    subtitle: '조선 선비 의관의 모던 리디자인, 글로벌 명품 브랜드 협업 쇄도… "전통은 낡은 것이 아닌 가장 세련된 미래"',
    summary: '한국 전통 한복의 도포 자락과 흑립(갓)의 투명한 실루엣이 글로벌 럭셔리 패션위크의 메인 테마로 급부상하고 있다.',
    content: `펄럭이는 도포 자락의 우아한 드레이핑, 반투명한 말총 갓 사이로 비치는 모델의 실루엣이 2026 파리 오트쿠튀르 컬렉션 런웨이를 가득 메웠다.

세계 3대 패션위크에서 한국의 전통 복식 미학이 글로벌 디자이너들의 핵심 영감으로 떠오르고 있다. 프랑스 유력 패션지는 이번 시즌을 "한국적 선(Korean Lines)과 흑백의 미니멀리즘이 지배한 해"로 명명했다.

특히 조선 선비들이 착용했던 '도포'의 뒷자락 덧옷 구조는 현대 트렌치코트와 케이프에 혁신적인 실루엣을 부여했으며, 모시와 삼베 등 통기성 높은 천연 섬유는 친환경 서스테이너블 패션의 대안으로 각광받고 있다.

국내 신진 디자이너 그룹 '단청(DANCHUNG)'의 이도현 수석디자이너는 "한국 전통 복식의 핵심은 몸을 옥죄지 않고 옷과 인체 사이에 흐르는 '바람의 여백'에 있다"며 "서구식 테일러링이 줄 수 없는 유연함과 은근한 기품이 현대인들의 감성을 사로잡은 것"이라고 설명했다.

최진호 K-컬처 전문기자는 "과거 K-콘텐츠가 드라마와 팝 음악 중심이었다면, 이제는 한식, 한옥, 한복 등 라이프스타일과 깊은 철학을 품은 '헤리티지 K-컬처'로 진화하고 있다"고 분석했다.`,
    reporter: REPORTERS.choi_jh,
    publishedAt: '2026.08.21. 07:50',
    updatedAt: '2026.08.21. 09:20',
    views: 98400,
    shares: 1940,
    likes: 2840,
    reactions: {
      info: 820,
      exciting: 2150,
      empathy: 1980,
      analysis: 540,
      followup: 320,
    },
    imageUrl: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1200&q=80',
    imageCaption: '▲ 현대적으로 재해석된 갓과 도포 실루엣의 컬렉션 룩. [자료제공=K-헤리티지패션재단]',
    tags: ['한복', 'K-패션', '갓', '파리패션위크', '하이엔드패션', '도포'],
    sectionPage: '2면 문화',
    isTopHeadline: false,
    isBreaking: false,
    isEditorialPick: true,
    commentsCount: 67,
    badge: '기획',
    aiSummary: [
      '파리·밀라노 패션위크서 도포의 여백과 갓의 투명한 질감을 차용한 컬렉션 호평',
      '한국 전통 복식 특유의 여백과 천연 모시·삼베 직조가 글로벌 하이엔드 테마 부상',
      'K-콘텐츠가 음악·영상 중심에서 라이프스타일 및 헤리티지 철학으로 확장되는 추세',
    ],
  },
  {
    id: 'art-004',
    category: 'culture_art',
    categoryLabel: '문화·예술',
    subCategory: '공연·클래식',
    title: '종묘제례악 600년 울림, 베를린 필하모니 홀 매진… "우주와 인간 잇는 경이로운 대서사"',
    subtitle: '국립국악원 유럽 투어 첫 공연서 15분간 기립박수… 웅장한 편경·편종 소리에 유럽 청중 매료',
    summary: '조선 왕실 최고의 의례 음악인 종묘제례악이 독일 베를린 필하모니 홀 무대에 올라 전석 매진과 함께 현지 평단의 극찬을 이끌어냈다.',
    content: `돌을 깎아 만든 16개의 편경(編磬)이 맑고 청아한 소리를 내고, 쇠를 부어 만든 편종(編鐘)의 깊은 잔향이 베를린 필하모니 홀의 천장을 울렸다.

국립국악원 정악단과 무용단 60여 명이 무대에 올린 '종묘제례악(宗廟祭禮樂)' 전막 공연이 20일(현지시간) 독일 베를린에서 유럽 관객들을 마주했다. 2400석 전석이 매진된 가운데 진행된 이날 공연은 연주가 끝난 후 15분 동안 기립박수가 이어졌다.

종묘제례악은 세종대왕이 직접 창제하고 세조 때 다듬어진 조선 왕실 최고의 제례악으로, 2001년 유네스코 인류무형문화유산으로 지정된 바 있다. 음악(樂)과 노래(歌), 무용(舞)이 엄격한 예법 속에 일체를 이루는 종합 예술이다.

독일의 저명 음악평론가 한스 베버는 "바흐의 마태수난곡이나 베토벤 9번 교향곡이 인간 내면의 고뇌와 환희를 노래한다면, 한국의 종묘제례악은 우주의 질서와 하늘, 땅, 조상이 하나로 만나는 숭고한 평정을 보여준다"고 평했다.

이수민 공연예술전문기자는 "서양 클래식 음악의 성지인 베를린에서 한국의 궁중 음악이 이토록 뜨거운 찬사를 받은 것은 동양적 세계관과 조화의 미학이 오늘날 전 지구적 갈등 시대에 깊은 영적 위안을 주고 있음을 방증한다"고 전했다.`,
    reporter: REPORTERS.lee_sm,
    publishedAt: '2026.08.21. 06:40',
    updatedAt: '2026.08.21. 08:10',
    views: 76200,
    shares: 1450,
    likes: 2130,
    reactions: {
      info: 640,
      exciting: 1680,
      empathy: 1840,
      analysis: 490,
      followup: 210,
    },
    imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80',
    imageCaption: '▲ 베를린 필하모니 홀 무대에서 연주 중인 국립국악원 종묘제례악 연주단. [사진=국립국악원]',
    tags: ['종묘제례악', '국립국악원', '베를린필하모니', '궁중음악', '편경', '세종대왕'],
    sectionPage: '3면 공연',
    isTopHeadline: false,
    isBreaking: false,
    isEditorialPick: true,
    commentsCount: 54,
    badge: '해설',
    aiSummary: [
      '국립국악원 종묘제례악 전막 공연, 베를린 필하모니 홀 2400석 전석 매진 및 기립박수',
      '편경·편종의 웅장한 사운드와 절제된 일무(佾舞)로 우주와 인간의 조화로운 미학 전달',
      '현지 평단 "동양의 깊은 세계관과 평정이 담긴 인류 최고의 종합 의례 예술" 극찬',
    ],
  },
  {
    id: 'art-005',
    category: 'opinion',
    categoryLabel: '오피니언',
    subCategory: '문화시평',
    title: '[강서윤 칼럼] 인공지능 시대, 왜 우리는 다시 한옥의 ‘차경(借景)’을 찾는가',
    subtitle: '기계가 그린 화려한 풍경보다 창문 너머 자연을 빌려오는 비움과 겸손의 건축 철학',
    summary: 'AI와 디지털이 일상을 압도할수록 현대인들은 창을 통해 자연을 그대로 품는 한옥의 차경 미학에서 진정한 치유를 얻고 있다.',
    content: `초거대 AI가 1초 만에 수만 장의 초현실적 이미지를 생성해내고, 메타버스가 현실의 감각을 확장하는 2026년 오늘, 역설적이게도 가장 많은 2030 청년들이 몰려드는 곳은 100년 된 북촌과 서촌의 낡은 한옥들이다.

한옥 건축의 백미는 단연 '차경(借景)'에 있다. 글자 그대로 '풍경을 소유하지 않고 잠시 빌려 쓴다'는 뜻이다. 한옥의 창문은 벽을 막아서는 경계가 아니라, 사계절의 햇살과 바람, 마당의 감나무와 처마 끝 빗방울을 액자처럼 담아내는 자연의 렌즈다.

서양의 전통 건축이 자연을 지배하고 통제하기 위해 단단한 석조 벽과 완벽한 비례를 구축했다면, 우리의 선조들은 집의 기둥과 처마를 열어젖혀 바깥 풍경이 거실 안마당으로 스며들게 만들었다. 주인이 풍경을 독점하지 않으니 마음에는 욕망 대신 여백이 차오른다.

기술의 속도가 인간의 호흡을 앞지를 때, 우리가 기댈 곳은 알고리즘의 화려함이 아니라 흙과 나무, 그리고 바람의 순리다. 한옥 툇마루에 앉아 처마 너머 흐르는 구름을 바라보는 일, 그것은 인공지능이 결코 대신해 줄 수 없는 인간 고유의 감각적 평화다.

이제 우리는 도시의 빌딩 숲 속에서도 차경의 지혜를 복원해야 한다. 닫힌 스크린에서 눈을 돌려 열린 창을 만들고, 소유하려는 욕망을 비워내 자연의 숨결을 빌려 쓰는 것. 그것이 바로 한국 전통 미학이 오늘날 디지털 피로 사회에 건네는 가장 절실한 치유의 처방전이다.`,
    reporter: REPORTERS.kang_sy,
    publishedAt: '2026.08.21. 06:00',
    updatedAt: '2026.08.21. 07:30',
    views: 62400,
    shares: 1780,
    likes: 3120,
    reactions: {
      info: 510,
      exciting: 430,
      empathy: 3410,
      analysis: 890,
      followup: 180,
    },
    imageUrl: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=1200&q=80',
    imageCaption: '▲ 창경궁 인근 한옥 대청마루에서 바라본 마당 풍경. 창틀이 자연의 사계를 담아내는 액자가 된다.',
    tags: ['차경', '한옥', '한국건축', '강서윤칼럼', '문화시평', '디지털디톡스'],
    sectionPage: '4면 오피니언',
    isTopHeadline: false,
    isBreaking: false,
    isEditorialPick: true,
    commentsCount: 88,
    badge: '칼럼',
    aiSummary: [
      '디지털 AI 시대 속 자연을 빌려 쓰는 한옥 고유의 ‘차경(借景)’ 미학의 부활 조명',
      '자연을 통제하지 않고 창틀을 통해 사계절의 여백을 품어내는 선조들의 지혜',
      '스크린 피로에 지친 현대인에게 소유 대신 비움과 조화를 권하는 문화적 치유론',
    ],
  },
  {
    id: 'art-006',
    category: 'photo_video',
    categoryLabel: '포토·영상',
    subCategory: '궁궐 화보',
    title: '[포토 스토리] 안개 걷힌 창덕궁 후원, 가을 맞이 연경당의 아침 비경',
    subtitle: '조선 왕실의 비밀 정원… 고즈넉한 부용지 연못과 처마 끝에 맺힌 아침 이슬',
    summary: '초가을을 앞둔 창덕궁 후원의 신비로운 아침 풍경을 한국문화저널 사진부가 초고화질 렌즈로 포착했다.',
    content: `조선 5대 궁궐 중 유일하게 유네스코 세계유산으로 등재된 창덕궁. 그중에서도 일반인의 발길이 제한되는 아침 시간대 후원의 비경이 공개된다.

연못 부용지(芙蓉池) 주변으로 물안개가 피어오르고, 부용정(芙蓉亭)의 십자형 정자가 고요한 수면에 데칼코마니처럼 반사된다. 효명세자가 독서를 위해 지었던 사대부 양식의 연경당(演慶堂)에는 단청을 칠하지 않은 백골집 특유의 단아함이 소나무 숲과 어우러진다.

창덕궁 후원은 인위적인 분수나 조각상 대신 지형의 높낮이와 자연 숲을 그대로 살려 전각을 배치한 한국 조경 예술의 정수로 꼽힌다.`,
    reporter: REPORTERS.kim_yr,
    publishedAt: '2026.08.21. 07:10',
    views: 89300,
    shares: 2110,
    likes: 3950,
    reactions: {
      info: 720,
      exciting: 2410,
      empathy: 2890,
      analysis: 230,
      followup: 450,
    },
    imageUrl: 'https://images.unsplash.com/photo-1548115184-bc6544d06a58?auto=format&fit=crop&w=1200&q=80',
    imageCaption: '▲ 맑은 아침 햇살을 머금은 창덕궁 부용정과 부용지 연못의 고즈넉한 자태. [사진=한국문화저널 특별취재팀]',
    tags: ['창덕궁', '창덕궁후원', '부용지', '궁궐야경', '포토뉴스', '한국의미'],
    sectionPage: '5면 포토',
    isTopHeadline: false,
    isBreaking: false,
    isEditorialPick: false,
    commentsCount: 39,
    badge: '포토',
    aiSummary: [
      '유네스코 세계유산 창덕궁 후원 부용지와 연경당의 가을맞이 아침 풍경 취재',
      '인공미를 배제하고 자연 지형과 조화를 이룬 한국 전통 조경의 정수 조명',
    ],
  },
  {
    id: 'art-007',
    category: 'heritage',
    categoryLabel: '전통과 유산',
    subCategory: '장인·공예',
    title: '"조개껍데기 0.1mm 갈아 천년 빛 새긴다"… 나전칠기 50년 명장 손혜원 선생',
    subtitle: '통영 앞바다 전복패로 빚어내는 무지갯빛 우주… "기계는 흉내 못 내는 장인의 영혼"',
    summary: '경상남도 통영의 전통 공방에서 50년 넘게 나전칠기의 명맥을 이어오고 있는 명장을 만나 사라져가는 전통 공예의 혼을 들었다.',
    content: `칠흑같이 검은 옻칠 바탕 위에 영롱한 푸른빛과 붉은빛의 자개가 오색 무지개처럼 일렁인다. 통영 나전칠기는 고려 시대 팔만대장경 경판 상자부터 조선 왕실의 보물상자에 이르기까지 천 년의 역사를 지켜온 한국 공예의 자존심이다.

"전복 껍데기를 숫돌에 갈고 또 갈아 종이보다 얇은 0.1mm 두께로 만드는 데만 며칠 밤낮이 걸립니다. 칼끝 하나에 숨을 멈추고 문양을 새겨 넣을 때 비로소 자개가 빛을 발하죠."

손 명장의 손마디는 수십 년간 옻을 다루며 굳은살이 박여 있었다. 최근에는 젊은 현대 가구 디자이너들과의 협업을 통해 블루투스 스피커, 스마트폰 케이스, 명품 탁자 등에 나전을 입히는 시도로 해외 전시회에서 큰 주목을 받고 있다.`,
    reporter: REPORTERS.park_cw,
    publishedAt: '2026.08.20. 18:20',
    views: 54100,
    shares: 1120,
    likes: 1980,
    reactions: {
      info: 890,
      exciting: 740,
      empathy: 2190,
      analysis: 310,
      followup: 180,
    },
    imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
    imageCaption: '▲ 전통 기법으로 완성된 나전칠기 보석함의 정교한 자개 문양 디테일.',
    tags: ['나전칠기', '무형문화재', '장인정신', '통영자개', '전통공예', '옻칠'],
    sectionPage: '3면 문화기획',
    badge: '인터뷰',
    commentsCount: 27,
  },
  {
    id: 'art-008',
    category: 'k_culture',
    categoryLabel: 'K-컬처·엔터',
    subCategory: 'K-푸드·식문화',
    title: '항아리 속 3년 묵은 김치와 된장의 마법… 세계 과학계 "한국 발효 과학의 경이로움" 주목',
    subtitle: '옹기 숨구멍과 유산균의 하모니, 미국 스탠퍼드 연구진 마이크로바이옴 논문 게재',
    summary: '한국 전통 옹기에서 숙성되는 발효 식품의 미생물 군집과 면역 증진 효과가 국제 저명 학술지에 잇달아 소개되며 K-푸드의 위상이 높아지고 있다.',
    content: `숨 쉬는 그릇 '옹기(甕器)'와 시간의 결이 빚어낸 한국의 발효 식문화가 세계 미식계를 넘어 의과학계의 집중 조명을 받고 있다.

미국 스탠퍼드 의대 미생물학 연구팀은 최근 국제 학술지를 통해 "전통 옹기에서 3년 이상 자연 발효된 한국의 전통 된장과 묵은지에서 유익 미생물 군집의 다양성과 장내 면역 조절 물질이 극대화되는 현상을 규명했다"고 발표했다.

옹기는 흙의 미세한 공기구멍 덕분에 외부 공기를 순환시키면서도 빗물은 차단해 최적의 발효 환경을 유지한다. 선조들이 '살아있는 그릇'이라 부른 이유가 첨단 과학으로 입증된 셈이다.`,
    reporter: REPORTERS.choi_jh,
    publishedAt: '2026.08.20. 15:40',
    views: 82000,
    shares: 1830,
    likes: 2750,
    reactions: {
      info: 1620,
      exciting: 940,
      empathy: 2310,
      analysis: 720,
      followup: 160,
    },
    imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1200&q=80',
    imageCaption: '▲ 경기도 안성의 종가 장독대에 늘어선 전통 발효 옹기 항아리들.',
    tags: ['K-푸드', '발효과학', '옹기', '김치', '된장', '마이크로바이옴'],
    sectionPage: '2면 생활문화',
    badge: '기획',
    commentsCount: 45,
  },
];

export const MOCK_COMMENTS: Record<string, any[]> = {
  'art-001': [
    {
      id: 'c-1',
      articleId: 'art-001',
      author: '문화애호가_솔바람',
      authorBadge: '우수독자',
      content: '대영박물관에 있던 달항아리가 고국에 오다니 감격스럽습니다. 9월 1일 티켓 오픈하자마자 바로 예매할 예정입니다. 조선 백자의 담백한 곡선은 볼 때마다 마음이 정화됩니다.',
      createdAt: '2026.08.21. 09:12',
      likes: 124,
      dislikes: 2,
    },
    {
      id: 'c-2',
      articleId: 'art-001',
      author: '도자공예연구원',
      authorBadge: '전문가',
      content: '기사 설명대로 달항아리는 위아래를 따로 붙여 구워내는 게 가장 고난도 기술이죠. 완벽한 대칭이 아닌데도 풍성한 균형감이 나오는 게 한국 미학의 정수입니다. 좋은 기사 감사합니다.',
      createdAt: '2026.08.21. 09:40',
      likes: 89,
      dislikes: 1,
    },
    {
      id: 'c-3',
      articleId: 'art-001',
      author: 'SeoulArt2026',
      content: '자연광 조명으로 전시를 연출한다는 점이 정말 기대되네요. 미술관 조명이 너무 인위적이면 백자 본연의 은은한 유백색을 느끼기 어렵거든요.',
      createdAt: '2026.08.21. 10:05',
      likes: 45,
      dislikes: 0,
    },
  ],
  'art-002': [
    {
      id: 'c-21',
      articleId: 'art-002',
      author: '헤리티지러버',
      authorBadge: '열혈구독자',
      content: '지천년 견오백! 천 년을 가는 우리 한지의 가치를 세계가 알아주는군요. 고문서 복원에 한지가 쓰인다는 건 알수록 자랑스럽습니다.',
      createdAt: '2026.08.21. 09:35',
      likes: 156,
      dislikes: 1,
    },
    {
      id: 'c-22',
      articleId: 'art-002',
      author: '전주한지공방',
      content: '현장에서 묵묵히 닥나무 삶고 종이 뜨는 무형문화재 장인분들께 깊은 경의를 표합니다. 정부에서도 실질적인 전승 지원이 이어지길 바랍니다.',
      createdAt: '2026.08.21. 09:58',
      likes: 92,
      dislikes: 0,
    },
  ],
};

export const CULTURAL_EVENTS: CulturalEvent[] = [
  {
    id: 'ev-1',
    title: '2026 경복궁·창경궁 가을 야간 특별관람',
    place: '경복궁 근정전 및 창경궁 통명전 일원',
    period: '2026.09.01 ~ 10.31',
    category: '고궁야간',
    imageUrl: 'https://images.unsplash.com/photo-1548115184-bc6544d06a58?auto=format&fit=crop&w=600&q=80',
    dDay: 'D-11',
    status: '예매중',
  },
  {
    id: 'ev-2',
    title: '국립현대미술관 특별전 <달을 품은 백자, 오늘의 조형>',
    place: '국립현대미술관 서울관 1, 2전시실',
    period: '2026.09.01 ~ 11.30',
    category: '전시',
    imageUrl: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=600&q=80',
    dDay: 'D-11',
    status: '진행중',
  },
  {
    id: 'ev-3',
    title: '국립극장 창작 국악 칸타타 <조선의 빛, 훈민정음>',
    place: '국립극장 해오름극장',
    period: '2026.08.28 ~ 09.06',
    category: '공연',
    imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80',
    dDay: 'D-7',
    status: '마감임박',
  },
  {
    id: 'ev-4',
    title: '2026 전주세계소리축제 & 한지 문화제',
    place: '전주 한옥마을 및 한국소리문화의전당',
    period: '2026.09.15 ~ 09.20',
    category: '축제',
    imageUrl: 'https://images.unsplash.com/photo-1582738411706-bfc8e691d1c2?auto=format&fit=crop&w=600&q=80',
    dDay: 'D-25',
    status: '진행중',
  },
];

export const ISSUE_CLUSTERS: IssueCluster[] = [
  {
    id: 'iss-1',
    keyword: '#국보_달항아리_귀환',
    headline: '대영박물관·메트 소장 백자 30점 국립중앙박물관 총집결',
    articleCount: 18,
    timeAgo: '12분 전',
  },
  {
    id: 'iss-2',
    keyword: '#유네스코_한지_등재',
    headline: '천년의 종이 한지, 12월 세계무형유산 등재 확실시',
    articleCount: 24,
    timeAgo: '25분 전',
  },
  {
    id: 'iss-3',
    keyword: '#K-헤리티지_패션위크',
    headline: '파리·밀라노 사로잡은 선비 도포와 갓의 우아함',
    articleCount: 15,
    timeAgo: '1시간 전',
  },
  {
    id: 'iss-4',
    keyword: '#종묘제례악_베를린_전석매진',
    headline: '유럽을 뒤흔든 조선 왕실 음악의 숭고한 울림',
    articleCount: 12,
    timeAgo: '2시간 전',
  },
];

export const PAPER_PAGES: PaperPage[] = [
  {
    pageNumber: 1,
    title: '1면 종합 헤드라인',
    sectionName: '종합',
    date: '2026년 8월 21일 금요일 (제18,450호)',
    articles: [INITIAL_ARTICLES[0], INITIAL_ARTICLES[1]],
  },
  {
    pageNumber: 2,
    title: '2면 K-컬처 및 글로벌 트렌드',
    sectionName: '문화·트렌드',
    date: '2026년 8월 21일 금요일 (제18,450호)',
    articles: [INITIAL_ARTICLES[2], INITIAL_ARTICLES[7]],
  },
  {
    pageNumber: 3,
    title: '3면 공연예술 및 문화기획',
    sectionName: '예술·공연',
    date: '2026년 8월 21일 금요일 (제18,450호)',
    articles: [INITIAL_ARTICLES[3], INITIAL_ARTICLES[6]],
  },
  {
    pageNumber: 4,
    title: '4면 오피니언 & 포토 비평',
    sectionName: '오피니언·포토',
    date: '2026년 8월 21일 금요일 (제18,450호)',
    articles: [INITIAL_ARTICLES[4], INITIAL_ARTICLES[5]],
  },
];

export const CATEGORY_TABS = [
  { id: 'all' as const, label: '주요뉴스', subcategories: ['헤드라인', '실시간속보', '인기뉴스', '이슈포커스'] },
  { id: 'culture_art' as const, label: '문화·예술', subcategories: ['미술·전시', '공연·클래식', '문학·출판', '전통예술'] },
  { id: 'k_culture' as const, label: 'K-컬처·엔터', subcategories: ['한류패션', 'K-뮤직', '영상·스토리', 'K-푸드'] },
  { id: 'heritage' as const, label: '전통과 유산', subcategories: ['국가유산', '무형문화재', '고궁·사찰', '한옥·공예'] },
  { id: 'opinion' as const, label: '오피니언', subcategories: ['문화시평', '데스크칼럼', '예술가인터뷰', '독자투고'] },
  { id: 'photo_video' as const, label: '포토·영상', subcategories: ['고화질화보', '카드뉴스', '현장포토', '다큐영상'] },
  { id: 'paper_edition' as const, label: '📰 지면보기', subcategories: ['1면 종합', '2면 문화', '3면 예술', '4면 오피니언'] },
];
