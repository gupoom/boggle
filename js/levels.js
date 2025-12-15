// js/levels.js
// 난이도 재정립: 1단계(3글자), 2단계(4글자), 3단계(5글자 이상 통합)
// 모든 단어에 뜻풀이(desc)와 영어(eng, eng_desc) 정보를 추가했습니다.

const LEVEL_WORDS = {
    // [Level 1] 초급 (3글자)
    "1": [
        // 가수
        { word: "마마무", category: "가수", desc: "뛰어난 가창력과 퍼포먼스를 자랑하는 4인조 걸그룹.", eng: "Mamamoo", eng_desc: "A South Korean girl group known for their strong vocals." },
        { word: "비투비", category: "가수", desc: "발라드와 댄스를 넘나드는 실력파 보이그룹.", eng: "BTOB", eng_desc: "A South Korean boy group known for their emotional ballads." },
        { word: "잔나비", category: "가수", desc: "서정적인 가사와 멜로디가 특징인 밴드.", eng: "Jannabi", eng_desc: "A Korean indie rock band known for their lyrical music." },
        { word: "아이유", category: "가수", desc: "대한민국의 대표적인 여성 솔로 가수이자 배우.", eng: "IU", eng_desc: "A representative South Korean female solo singer and actress." },
        { word: "에스파", category: "가수", desc: "메타버스 세계관을 가진 4인조 걸그룹.", eng: "aespa", eng_desc: "A girl group known for their unique metaverse concept." },
        { word: "아이브", category: "가수", desc: "당당한 매력으로 사랑받는 인기 걸그룹.", eng: "IVE", eng_desc: "A popular girl group known for their confident concept." },
        { word: "뉴진스", category: "가수", desc: "청량하고 자연스러운 매력의 걸그룹.", eng: "NewJeans", eng_desc: "A girl group famous for their fresh and natural vibe." },
        { word: "박효신", category: "가수", desc: "호소력 짙은 목소리의 대한민국 대표 발라드 가수.", eng: "Park Hyo-shin", eng_desc: "A famous ballad singer known for his deep, appealing voice." },
        { word: "이효리", category: "가수", desc: "대한민국의 아이콘이라 불리는 솔로 가수.", eng: "Lee Hyo-ri", eng_desc: "A solo singer and icon of South Korean pop culture." },
        { word: "성시경", category: "가수", desc: "감미로운 목소리로 '발라드의 황태자'라 불리는 가수.", eng: "Sung Si-kyung", eng_desc: "A ballad singer known for his sweet, soothing voice." },
        { word: "임영웅", category: "가수", desc: "트로트 열풍을 이끈 국민 가수.", eng: "Lim Young-woong", eng_desc: "A trot singer who led the genre's massive popularity." },
        { word: "김호중", category: "가수", desc: "성악가 출신의 트로트 가수.", eng: "Kim Ho-joong", eng_desc: "A trot singer with a background in classical opera." },
        { word: "싸이", category: "가수", desc: "'강남스타일'로 세계적인 인기를 얻은 가수.", eng: "PSY", eng_desc: "A singer who gained global fame with 'Gangnam Style'." },
        { word: "지코", category: "가수", desc: "트렌디한 힙합 음악을 만드는 래퍼이자 프로듀서.", eng: "Zico", eng_desc: "A trendy rapper and producer in the K-pop scene." },
        { word: "태연", category: "가수", desc: "소녀시대의 리더이자 믿고 듣는 보컬리스트.", eng: "Taeyeon", eng_desc: "Leader of Girls' Generation and a renowned vocalist." },
        { word: "에일리", category: "가수", desc: "폭발적인 가창력을 가진 디바.", eng: "Ailee", eng_desc: "A solo singer known for her powerful vocal skills." },
        { word: "우즈", category: "가수", eng: "WOODZ" },

        // 관광지/장소
        { word: "해운대", category: "관광지", desc: "부산을 대표하는 유명한 해수욕장.", eng: "Haeundae", eng_desc: "A famous beach representing Busan, South Korea." },
        { word: "경복궁", category: "관광지", desc: "조선 시대의 정궁이자 서울의 대표 고궁.", eng: "Gyeongbokgung", eng_desc: "The main royal palace of the Joseon dynasty in Seoul." },
        { word: "한라산", category: "관광지", desc: "제주도에 있는 대한민국에서 가장 높은 산.", eng: "Hallasan", eng_desc: "The highest mountain in South Korea, located on Jeju Island." },
        { word: "석굴암", category: "관광지", desc: "경주에 있는 통일 신라 시대의 불교 유적.", eng: "Seokguram", eng_desc: "A Buddhist grotto from the Silla dynasty in Gyeongju." },
        { word: "불국사", category: "관광지", desc: "유네스코 세계문화유산으로 지정된 경주의 절.", eng: "Bulguksa", eng_desc: "A historic temple in Gyeongju, a UNESCO World Heritage site." },
        { word: "첨성대", category: "관광지", desc: "동양에서 가장 오래된 천문대.", eng: "Cheomseongdae", eng_desc: "The oldest astronomical observatory in East Asia." },
        { word: "제주도", category: "관광지", desc: "아름다운 자연경관을 자랑하는 대한민국의 섬.", eng: "Jeju Island", eng_desc: "A South Korean island known for its beautiful nature." },
        { word: "광안리", category: "관광지", desc: "광안대교 야경이 아름다운 부산의 해변.", eng: "Gwangalli", eng_desc: "A beach in Busan famous for the night view of the bridge." },
        { word: "다자이", category: "관광지", desc: "일본 후쿠오카현의 유명한 신사 관광지.", eng: "Dazaifu", eng_desc: "A famous shrine and tourist spot in Fukuoka, Japan." },
        { word: "동대문", category: "관광지", desc: "쇼핑몰과 패션의 중심지인 서울의 명소.", eng: "Dongdaemun", eng_desc: "A major shopping and fashion district in Seoul." },

        // 음식
        { word: "떡볶이", category: "음식", desc: "떡과 어묵을 매콤한 양념에 볶은 요리.", eng: "Tteokbokki", eng_desc: "Spicy stir-fried rice cakes." },
        { word: "미역국", category: "음식", desc: "생일에 주로 먹는 미역을 넣은 국.", eng: "Miyeok-guk", eng_desc: "Seaweed soup traditionally eaten on birthdays." },
        { word: "된장국", category: "음식", desc: "된장을 풀어 끓인 구수한 국.", eng: "Doenjang-guk", eng_desc: "Soybean paste soup." },
        { word: "김치국", category: "음식", desc: "김치를 넣어 얼큰하게 끓인 국.", eng: "Kimchi-guk", eng_desc: "Spicy kimchi soup." },
        { word: "불고기", category: "음식", desc: "얇게 썬 고기를 양념에 재워 구운 요리.", eng: "Bulgogi", eng_desc: "Marinated slices of beef grilled on a barbecue." },
        { word: "비빔밥", category: "음식", desc: "밥에 각종 나물과 고추장을 넣어 비벼 먹는 음식.", eng: "Bibimbap", eng_desc: "Rice mixed with vegetables and chili paste." },
        { word: "삼겹살", category: "음식", desc: "한국인이 가장 즐겨 먹는 돼지고기 구이.", eng: "Samgyeopsal", eng_desc: "Grilled pork belly, a favorite among Koreans." },
        { word: "갈비찜", category: "음식", desc: "갈비를 간장 양념에 푹 익혀 만든 요리.", eng: "Galbijjim", eng_desc: "Braised short ribs." },
        { word: "돈가스", category: "음식", desc: "돼지고기에 튀김옷을 입혀 튀긴 요리.", eng: "Pork Cutlet", eng_desc: "A breaded, deep-fried pork cutlet." },
        { word: "탕수육", category: "음식", desc: "튀긴 고기에 새콤달콤한 소스를 곁들인 요리.", eng: "Tangsuyuk", eng_desc: "Sweet and sour pork." },
        { word: "짜장면", category: "음식", desc: "춘장 소스에 면을 비벼 먹는 중화요리.", eng: "Jajangmyeon", eng_desc: "Noodles in black bean sauce." },
        { word: "마라탕", category: "음식", desc: "중국 향신료 마라를 넣고 끓인 매운 탕 요리.", eng: "Malatang", eng_desc: "Spicy Chinese hot pot soup." },
        { word: "바나나", category: "음식", desc: "길고 굽은 모양의 노란색 열대 과일.", eng: "Banana", eng_desc: "A long, curved yellow fruit." },
        { word: "토마토", category: "음식", desc: "붉은색을 띠는 영양가 높은 채소.", eng: "Tomato", eng_desc: "A red, juicy vegetable (botanically a fruit)." },

        // 동물/자연/기타
        { word: "강아지", category: "동물", desc: "사람과 가장 친근한 반려동물.", eng: "Puppy", eng_desc: "A young dog." },
        { word: "고양이", category: "동물", desc: "날렵하고 도도한 매력의 반려동물.", eng: "Cat", eng_desc: "A small domesticated carnivorous mammal." },
        { word: "호랑이", category: "동물", desc: "용맹함을 상징하는 맹수.", eng: "Tiger", eng_desc: "A large wild cat with stripes." },
        { word: "무지개", category: "자연", desc: "비 온 뒤 하늘에 뜨는 일곱 빛깔 띠.", eng: "Rainbow", eng_desc: "A colorful arc appearing in the sky after rain." },
        { word: "소나무", category: "식물", desc: "늘 푸른 잎을 가진 대표적인 침엽수.", eng: "Pine Tree", eng_desc: "An evergreen coniferous tree." },
        { word: "자동차", category: "탈것", desc: "엔진의 힘으로 바퀴를 굴려 가는 차.", eng: "Car", eng_desc: "A road vehicle typically with four wheels." },
        { word: "비행기", category: "탈것", desc: "하늘을 날아다니는 교통수단.", eng: "Airplane", eng_desc: "A powered flying vehicle with wings." },
        { word: "자전거", category: "탈것", desc: "두 바퀴를 발로 굴려 가는 탈것.", eng: "Bicycle", eng_desc: "A vehicle composed of two wheels held in a frame." },
        { word: "컴퓨터", category: "가전", desc: "정보를 처리하고 계산하는 전자 기기.", eng: "Computer", eng_desc: "An electronic device for storing and processing data." },
        { word: "휴대폰", category: "가전", desc: "들고 다니며 통화할 수 있는 전화기.", eng: "Mobile Phone", eng_desc: "A portable telephone." },
        { word: "피아노", category: "악기", desc: "건반을 눌러 소리를 내는 악기.", eng: "Piano", eng_desc: "A large keyboard musical instrument." },
        { word: "아파트", category: "장소", desc: "여러 층으로 지어진 공동 주택.", eng: "Apartment", eng_desc: "A suite of rooms forming one residence." },
        { word: "런닝맨", category: "예능", desc: "오래 사랑받고 있는 장수 예능 프로그램.", eng: "Running Man", eng_desc: "A long-running South Korean variety show." }
    ],

    // [Level 2] 중급 (4글자)
    "2": [
        // 가수
        { word: "블랙핑크", category: "가수", desc: "세계적으로 큰 인기를 끄는 4인조 걸그룹.", eng: "BLACKPINK", eng_desc: "A world-famous South Korean girl group." },
        { word: "레드벨벳", category: "가수", desc: "다양한 콘셉트를 소화하는 걸그룹.", eng: "Red Velvet", eng_desc: "A girl group known for their diverse concepts." },
        { word: "오마이걸", category: "가수", desc: "몽환적이고 청순한 매력의 걸그룹.", eng: "Oh My Girl", eng_desc: "A girl group known for their dreamy and innocent vibe." },
        { word: "더보이즈", category: "가수", desc: "화려한 퍼포먼스의 보이그룹.", eng: "THE BOYZ", eng_desc: "A boy group known for their spectacular performances." },
        { word: "르세라핌", category: "가수", desc: "강인하고 두려움 없는 콘셉트의 걸그룹.", eng: "LE SSERAFIM", eng_desc: "A girl group with a fearless concept." },
        { word: "소녀시대", category: "가수", desc: "한류 열풍을 이끈 전설적인 걸그룹.", eng: "Girls' Generation", eng_desc: "A legendary girl group that led the Hallyu wave." },
        { word: "동방신기", category: "가수", desc: "아시아의 별이라 불리는 보이그룹.", eng: "TVXQ", eng_desc: "A boy group known as the 'Kings of K-pop'." },
        { word: "데이식스", category: "가수", desc: "모든 순간을 노래하는 밴드.", eng: "DAY6", eng_desc: "A popular Korean pop-rock band." },
        { word: "헌트릭스", category: "가수", eng: "Huntrix" },

        // 관광지/장소
        { word: "에버랜드", category: "관광지", desc: "대한민국 최대 규모의 테마파크.", eng: "Everland", eng_desc: "South Korea's largest theme park." },
        { word: "롯데월드", category: "관광지", desc: "서울 잠실에 있는 대형 놀이공원.", eng: "Lotte World", eng_desc: "A major recreation complex in Seoul." },
        { word: "남산타워", category: "관광지", desc: "서울의 랜드마크이자 야경 명소.", eng: "Namsan Tower", eng_desc: "A landmark tower in Seoul offering panoramic views." },
        { word: "광화문", category: "관광지", desc: "경복궁의 정문이자 서울의 상징적인 장소.", eng: "Gwanghwamun", eng_desc: "The main gate of Gyeongbokgung Palace." },
        { word: "독립기념관", category: "관광지", desc: "독립운동의 역사를 기리는 기념관.", eng: "Independence Hall", eng_desc: "A museum dedicated to the Korean independence movement." },
        { word: "롯데타워", category: "관광지", desc: "대한민국에서 가장 높은 초고층 빌딩.", eng: "Lotte World Tower", eng_desc: "The tallest skyscraper in South Korea." },
        { word: "한옥마을", category: "관광지", desc: "전통 한옥이 모여 있는 관광지.", eng: "Hanok Village", eng_desc: "A village of traditional Korean houses." },

        // 음식
        { word: "김치찌개", category: "음식", desc: "김치를 주재료로 하여 끓인 찌개.", eng: "Kimchi-jjigae", eng_desc: "Kimchi stew." },
        { word: "된장찌개", category: "음식", desc: "된장을 풀어 두부 등을 넣고 끓인 찌개.", eng: "Doenjang-jjigae", eng_desc: "Soybean paste stew." },
        { word: "제육볶음", category: "음식", desc: "돼지고기를 매콤하게 볶은 요리.", eng: "Jeyuk Bokkeum", eng_desc: "Stir-fried spicy pork." },
        { word: "계란말이", category: "음식", desc: "달걀을 풀어서 얇게 부쳐 만 밥반찬.", eng: "Rolled Omelet", eng_desc: "A rolled egg omelet." },
        { word: "감자튀김", category: "음식", desc: "감자를 기름에 튀긴 간식.", eng: "French Fries", eng_desc: "Fried potatoes." },
        { word: "치즈버거", category: "음식", desc: "패티 위에 치즈를 얹은 햄버거.", eng: "Cheeseburger", eng_desc: "A hamburger topped with cheese." },
        { word: "스테이크", category: "음식", desc: "두툼한 고기를 구운 요리.", eng: "Steak", eng_desc: "Rice bowl topped with steak." },

        // 사물/기타
        { word: "대한민국", category: "국가", desc: "동아시아에 위치한 우리의 조국.", eng: "Republic of Korea", eng_desc: "A country in East Asia." },
        { word: "고등학교", category: "장소", desc: "중학교를 졸업하고 진학하는 학교.", eng: "High School", eng_desc: "A secondary school." },
        { word: "대학교", category: "장소", desc: "고등 교육을 실시하는 교육 기관.", eng: "University", eng_desc: "An institution of higher education." },
        { word: "백화점", category: "장소", desc: "여러 가지 물건을 파는 대규모 상점.", eng: "Department Store", eng_desc: "A large retail store." },
        { word: "스마트폰", category: "가전", desc: "컴퓨터 기능이 있는 휴대전화.", eng: "Smartphone", eng_desc: "A mobile phone that performs many computer functions." },
        { word: "노트북", category: "가전", desc: "휴대할 수 있는 개인용 컴퓨터.", eng: "Laptop", eng_desc: "A portable personal computer." },
        { word: "공기청정기", category: "가전", desc: "실내 공기를 깨끗하게 해주는 기계.", eng: "Air Purifier", eng_desc: "A device that cleans the air." },
        { word: "무한도전", category: "예능", desc: "대한민국 리얼 버라이어티의 시초.", eng: "Infinite Challenge", eng_desc: "A legendary Korean variety show." },
        { word: "일석이조", category: "사자성어", desc: "돌 한 개로 새 두 마리를 잡는다는 뜻.", eng: "Killing two birds with one stone", eng_desc: "Solving two problems with one action." },
        { word: "동문서답", category: "사자성어", desc: "묻는 말에 대하여 엉뚱한 대답을 함.", eng: "Irrelevant answer", eng_desc: "Giving an answer that is unrelated to the question." },
        { word: "작심삼일", category: "사자성어", desc: "결심이 사흘을 가지 못함.", eng: "Giving up easily", eng_desc: "A resolution that lasts only three days." },
        { word: "대기만성", category: "사자성어", desc: "큰 그릇은 늦게 이루어진다는 뜻.", eng: "Late bloomer", eng_desc: "Great talents mature late." },
        { word: "유비무환", category: "사자성어", desc: "미리 준비하면 걱정이 없음.", eng: "Better safe than sorry", eng_desc: "Preparation prevents future worries." },
        { word: "권선징악", category: "사자성어", desc: "착한 일을 권하고 악한 일을 벌함.", eng: "Poetic justice", eng_desc: "Promoting good and punishing evil." }
        { word: "해바라기", category: "식물", desc: "해를 향해 자라는 노란 꽃.", eng: "Sunflower", eng_desc: "A tall plant with large yellow flowers." },
    ],

    // [Level 3] 고급 (5글자 이상 통합)
    "3": [
        // 가수
        { word: "슈퍼주니어", category: "가수", desc: "한류 제왕이라 불리는 장수 아이돌 그룹.", eng: "Super Junior", eng_desc: "A long-running K-pop boy group." },
        { word: "악동뮤지션", category: "가수", desc: "천재적인 작사, 작곡 능력의 남매 듀오.", eng: "AKMU", eng_desc: "A talented brother-sister duo." },
        { word: "여자아이들", category: "가수", desc: "독보적인 콘셉트의 실력파 걸그룹.", eng: "(G)I-DLE", eng_desc: "A girl group known for their unique concepts." },
        { word: "방탄소년단", category: "가수", desc: "글로벌 팝 아이콘이 된 보이그룹.", eng: "BTS", eng_desc: "A boy group that became global pop icons." },
        { word: "볼빨간사춘기", category: "가수", eng: "BOL4" },

        // 음식
        { word: "아이스크림", category: "음식", desc: "얼려서 만드는 달콤한 디저트.", eng: "Ice Cream", eng_desc: "A frozen sweet dessert." },
        { word: "아메리카노", category: "음식", desc: "에스프레소에 물을 넣어 연하게 마시는 커피.", eng: "Americano", eng_desc: "Espresso diluted with hot water." },
        { word: "초코우유", category: "음식", desc: "초콜릿 맛이 나는 우유.", eng: "Chocolate Milk", eng_desc: "Milk flavored with chocolate." },
        { word: "바나나우유", category: "음식", desc: "바나나 맛이 나는 노란 우유.", eng: "Banana Milk", eng_desc: "Banana-flavored milk." },
        { word: "순두부찌개", category: "음식", desc: "부드러운 순두부를 넣어 끓인 찌개.", eng: "Soft Tofu Stew", eng_desc: "Spicy stew with soft tofu." },
        { word: "고구마피자", category: "음식", desc: "고구마 무스를 토핑으로 올린 피자.", eng: "Sweet Potato Pizza", eng_desc: "Pizza topped with sweet potato mousse." },
        { word: "김치볶음밥", category: "음식", desc: "김치를 잘게 썰어 밥과 함께 볶은 요리.", eng: "Kimchi Fried Rice", eng_desc: "Fried rice with kimchi." },
        { word: "전주비빔밥", category: "음식", desc: "전주 지역의 특색 있는 비빔밥.", eng: "Jeonju Bibimbap", eng_desc: "A famous variation of bibimbap from Jeonju." },
        { word: "선지해장국", category: "음식", desc: "소의 피를 굳힌 선지를 넣은 국.", eng: "Ox Blood Soup", eng_desc: "Soup made with ox blood curds." },
        { word: "까르보나라", category: "음식", desc: "크림 소스를 베이스로 한 파스타.", eng: "Carbonara", eng_desc: "Creamy pasta." },
        { word: "오므라이스", category: "음식", desc: "볶음밥을 얇은 달걀지단으로 감싼 요리.", eng: "Omurice", eng_desc: "Fried rice wrapped in an omelet." },
        { word: "후라이드치킨", category: "음식", desc: "닭을 기름에 바삭하게 튀긴 요리.", eng: "Fried Chicken", eng_desc: "Crispy deep-fried chicken." },
        { word: "토마토스파게티", category: "음식", desc: "토마토 소스로 맛을 낸 파스타.", eng: "Tomato Spaghetti", eng_desc: "Spaghetti with tomato sauce." },
        { word: "크림스파게티", category: "음식", desc: "하얀 크림 소스로 만든 고소한 파스타.", eng: "Cream Spaghetti", eng_desc: "Spaghetti with white cream sauce." },
        { word: "뼈다귀해장국", category: "음식", desc: "돼지 등뼈를 푹 고아 만든 해장국.", eng: "Pork Bone Soup", eng_desc: "Soup made with pork backbone." },
        { word: "페퍼로니피자", category: "음식", desc: "페퍼로니 햄이 올라간 짭짤한 피자.", eng: "Pepperoni Pizza", eng_desc: "Pizza topped with pepperoni." },
        { word: "치즈오븐스파게티", category: "음식", desc: "치즈를 듬뿍 올려 오븐에 구운 스파게티.", eng: "Oven Baked Spaghetti", eng_desc: "Spaghetti baked with cheese." },

        // 관광지/사회/문화
        { word: "여수밤바다", category: "관광지", desc: "노래로도 유명한 여수의 아름다운 야경.", eng: "Yeosu Night Sea", eng_desc: "The beautiful night view of Yeosu sea." },
        { word: "해동용궁사", category: "관광지", desc: "바다 바로 옆에 위치한 부산의 절.", eng: "Haedong Yonggungsa", eng_desc: "A seaside temple in Busan." },
        { word: "한국민속촌", category: "관광지", desc: "옛 조상들의 생활 모습을 재현한 곳.", eng: "Korean Folk Village", eng_desc: "A village reproducing traditional Korean life." },
        { word: "오징어게임", category: "드라마", desc: "전 세계적으로 히트한 생존 서바이벌 드라마.", eng: "Squid Game", eng_desc: "A hit survival drama series." },
        { word: "이상한변호사", category: "드라마", desc: "천재적인 두뇌를 가진 변호사 우영우 이야기.", eng: "Extraordinary Attorney Woo", eng_desc: "A drama about a genius lawyer." },
        { word: "슬기로운의사생활", category: "드라마", desc: "병원, 감빵 등 특정 장소에서의 생활을 다룬 시리즈.", eng: "Wise Life Series", eng_desc: "A drama series depicting life in specific settings." },
        { word: "나혼자산다", category: "예능", desc: "1인 가구 연예인들의 일상을 보여주는 프로그램.", eng: "I Live Alone", eng_desc: "A reality show featuring celebrities living alone." },
        { word: "전지적참견시점", category: "예능", desc: "매니저들의 제보로 스타의 일상을 관찰하는 예능.", eng: "Omniscient Interfering View", eng_desc: "A show observing stars through their managers." },
        { word: "놀면뭐하니", category: "예능", desc: "유재석이 다양한 부캐로 활동하는 예능.", eng: "Hangout with Yoo", eng_desc: "A variety show featuring Yoo Jae-suk." },
        { word: "사회적거리두기", category: "사회", desc: "감염병 예방을 위해 사람들 간 거리를 유지하는 것.", eng: "Social Distancing", eng_desc: "Keeping distance to prevent infection." }
    ],

    // [Special] 신조어/밈
    "special": [
        { word: "갑분싸", category: "신조어", desc: "갑자기 분위기가 싸해짐.", eng: "Awkward Silence", eng_desc: "Suddenly the atmosphere becomes awkward." },
        { word: "인싸", category: "신조어", desc: "사람들과 잘 어울리는 '인사이더'.", eng: "Insider", eng_desc: "A popular person who fits in well." },
        { word: "아싸", category: "신조어", desc: "사람들과 잘 어울리지 못하는 '아웃사이더'.", eng: "Outsider", eng_desc: "A person who does not fit in well." },
        { word: "소확행", category: "신조어", desc: "소소하지만 확실한 행복.", eng: "Small but certain happiness", eng_desc: "Small but certain happiness." },
        { word: "워라밸", category: "신조어", desc: "일과 삶의 균형 (Work-Life Balance).", eng: "Work-Life Balance", eng_desc: "Balance between work and life." },
        { word: "내로남불", category: "신조어", desc: "내가 하면 로맨스, 남이 하면 불륜.", eng: "Double Standard", eng_desc: "Hypocrisy; judging others differently from oneself." },
        { word: "갓생", category: "신조어", desc: "부지런하고 모범적인 삶.", eng: "God-life", eng_desc: "Living a diligent and exemplary life." },
        { word: "알잘딱깔센", category: "신조어", desc: "알아서 잘 딱 깔끔하고 센스 있게.", eng: "Do it well and sensibly", eng_desc: "Do it perfectly on your own." },
        { word: "금사빠", category: "신조어", desc: "금방 사랑에 빠지는 사람.", eng: "Falls in love easily", eng_desc: "A person who falls in love quickly." },
        { word: "솔까말", category: "신조어", desc: "솔직히 까놓고 말해서.", eng: "Frankly speaking", eng_desc: "Speaking honestly and openly." },
        { word: "케바케", category: "신조어", desc: "경우에 따라 다르다 (Case by Case).", eng: "Case by case", eng_desc: "It depends on the situation." },
        { word: "사바사", category: "신조어", desc: "사람에 따라 다르다 (사람 by 사람).", eng: "Person by person", eng_desc: "It depends on the person." },
        { word: "먹방", category: "신조어", desc: "음식을 먹는 방송.", eng: "Mukbang", eng_desc: "An eating show." },
        { word: "지못미", category: "신조어", desc: "지켜주지 못해서 미안해.", eng: "Sorry I couldn't protect you", eng_desc: "Sorry for not being able to protect you (used jokingly)." },
        { word: "엄친아", category: "신조어", desc: "엄마 친구 아들 (모든 게 완벽한 사람).", eng: "Mr. Perfect", eng_desc: "Mom's friend's son; a perfect guy." },
        { word: "돈쭐", category: "신조어", desc: "착한 가게에 돈으로 혼내주다 (많이 사주다).", eng: "Supporting a good business", eng_desc: "Punishing with money (buying a lot to support)." },
        { word: "갓성비", category: "신조어", desc: "가성비가 아주 좋다.", eng: "Great value", eng_desc: "Extremely good value for money." },
        { word: "호캉스", category: "신조어", desc: "호텔에서 즐기는 바캉스.", eng: "Staycation", eng_desc: "Vacationing at a hotel." },
        { word: "너튜브", category: "신조어", desc: "유튜브를 돌려 말하는 표현.", eng: "YouTube", eng_desc: "A slang term for YouTube." },
        { word: "뇌피셜", category: "신조어", desc: "객관적 근거 없는 자신만의 생각.", eng: "Unverified opinion", eng_desc: "One's own idea without facts." },
        { word: "중꺾마", category: "신조어", desc: "중요한 건 꺾이지 않는 마음.", eng: "Unbreakable spirit", eng_desc: "The important thing is an unbreakable heart." },
        { word: "분조장", category: "신조어", desc: "분노 조절 장애.", eng: "Anger issues", eng_desc: "Difficulty controlling anger." }
    ]
};