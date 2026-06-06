import { WidgetType, MathArea, Difficulty } from '../types';

export interface SearchableWidget {
  type: WidgetType;
  title: string;
  category: MathArea[];
  difficulty: Difficulty;
  description: string;
  searchTerms: string[];
}

export const WIDGET_SEARCH_INDEX: SearchableWidget[] = [
  {
    type: WidgetType.NUMBER_LINE,
    title: 'Tallinje',
    category: [MathArea.TAL, MathArea.SAMBAND],
    difficulty: Difficulty.LABORATIVE,
    description: 'Visualisera talens inbördes ordning, intervall, negativa tal och decimaltal på en interaktiv linje.',
    searchTerms: [
      'tallinje', 'skala', 'intervall', 'negativa tal', 'decimaltal', 'heltal', 
      'rationella tal', 'avstånd', 'nollpunkt', 'bråkform', 'decimalform', 
      'ordning', 'större än', 'mindre än', 'position', 'pilar', 'zooma', 'hoppa'
    ]
  },
  {
    type: WidgetType.RULER,
    title: 'Linjal',
    category: [],
    difficulty: Difficulty.LABORATIVE,
    description: 'Ett transparent mätverktyg för att mäta längd och sträckor direkt på ritytan.',
    searchTerms: [
      'linjal', 'mäta', 'centimeter', 'millimeter', 'sträcka', 'längd', 
      'rät linje', 'ritverktyg', 'måttband', 'storlek', 'geometriverktyg'
    ]
  },
  {
    type: WidgetType.PROTRACTOR,
    title: 'Gradskiva',
    category: [],
    difficulty: Difficulty.LABORATIVE,
    description: 'Ett transparent geometriverktyg för att mäta och rita vinklar i grader.',
    searchTerms: [
      'gradskiva', 'vinkel', 'vinklar', 'grader', 'mäta vinklar', 'geometri', 
      'spetsig vinkel', 'trubbig vinkel', 'rät vinkel', 'vinkelsumma', 'cirkel', 'rotation'
    ]
  },
  {
    type: WidgetType.FRACTION,
    title: 'Bråk',
    category: [MathArea.TAL],
    difficulty: Difficulty.CONCRETIZING,
    description: 'Visualisera andelar som cirklar (tårtor) eller rektanglar för att förstå bråkdelar, täljare och nämnare.',
    searchTerms: [
      'bråk', 'andel', 'del av en helhet', 'täljare', 'nämnare', 'bråkdelar', 
      'tårta', 'cirkeldiagram', 'procent', 'decimaler', 'blandad form', 
      'förkorta', 'förlänga', 'ekvivalens', 'rektangel', 'visualisera andel'
    ]
  },
  {
    type: WidgetType.COORDINATES,
    title: 'Koordinatsystem',
    category: [MathArea.GEOMETRI, MathArea.SAMBAND],
    difficulty: Difficulty.CONCRETIZING,
    description: 'Placera ut punkter och rita linjer i ett koordinatsystem med fyra kvadranter.',
    searchTerms: [
      'koordinatsystem', 'x-axel', 'y-axel', 'origo', 'koordinat', 'punkter', 
      'kvadranter', 'funktionsmaskin', 'grafer', 'linjär funktion', 'geometri', 
      'rita linjer', 'koordinatpar'
    ]
  },
  {
    type: WidgetType.PROBABILITY,
    title: 'Sannolikhet',
    category: [MathArea.STATISTIK],
    difficulty: Difficulty.CONCRETIZING,
    description: 'Utforska risk, chans och sannolikhet i form av bråk och procent med träddiagram eller dragningar.',
    searchTerms: [
      'sannolikhet', 'chans', 'risk', 'utfall', 'slump', 'lyckosamma utfall', 
      'möjliga utfall', 'sannolikhetslära', 'procent', 'bråkform', 'gula och röda', 
      'dragning', 'med eller utan återläggning'
    ]
  },
  {
    type: WidgetType.NUMBER_OF_DAY,
    title: 'Dagens Tal',
    category: [],
    difficulty: Difficulty.CONCRETIZING,
    description: 'Undersök ett tals unika matematiska egenskaper, tiokompisar, talsorter och hälften/dubbelt.',
    searchTerms: [
      'dagens tal', 'talegenskaper', 'tiokompisar', 'hälften', 'dubbelt', 
      'udda', 'jämnt', 'primtal', 'talsorter', 'faktorer', 'delare', 
      'morgonsamling', 'lektionsstart', 'uppvärmning', 'slumpa tal'
    ]
  },
  {
    type: WidgetType.EQUATION,
    title: 'Ekvationer',
    category: [MathArea.ALGEBRA],
    difficulty: Difficulty.ABSTRACTING,
    description: 'Lös algebraiska obekanta med hjälp av en interaktiv balansvåg.',
    searchTerms: [
      'ekvationer', 'balansvåg', 'våg', 'obekant', 'variabel', 'x', 'x-värde', 
      'ekvationslösning', 'jämvikt', 'balansera', 'balans', 'algebra', 
      'förenkla', 'lösa ut x', 'lika med'
    ]
  },
  {
    type: WidgetType.FORMULAS,
    title: 'Formler',
    category: [],
    difficulty: Difficulty.FORMAL,
    description: 'En referens och beräknare för geometriska formler som area och omkrets.',
    searchTerms: [
      'formler', 'geometri', 'formelsamling', 'kvadrat', 'rektangel', 'triangel', 
      'cirkel', 'area', 'omkrets', 'pi', 'beräkna area', 'volym', 'formelblad'
    ]
  },
  {
    type: WidgetType.CALCULATOR,
    title: 'Räknare',
    category: [],
    difficulty: Difficulty.LABORATIVE,
    description: 'En digital miniräknare för dina grundläggande aritmetiska beräkningar under lektionen.',
    searchTerms: [
      'räknare', 'miniräknare', 'räkna', 'addera', 'subtrahera', 'multiplicera', 
      'dividera', 'skolräknare', 'grundläggande räknesätt', 'addition', 
      'subtraktion', 'multiplikation', 'division', 'procent'
    ]
  },
  {
    type: WidgetType.PERCENTAGE,
    title: 'Procent',
    category: [MathArea.TAL, MathArea.SAMBAND],
    difficulty: Difficulty.CONCRETIZING,
    description: 'Visualisera procent och andelar som ett fyllnadsbart rutnät av hundradelar.',
    searchTerms: [
      'procent', 'hundradelar', 'andel', 'bråk', 'decimaltal', 'procentform', 
      'procentenhet', 'visualisera', 'hundraruta', 'förhållande', 'del av helhet'
    ]
  },
  {
    type: WidgetType.BASE_10,
    title: 'Bas-klossar',
    category: [MathArea.TAL],
    difficulty: Difficulty.CONCRETIZING,
    description: 'Konkretisera positionssystemet med interaktiva ental, tiotal, hundratal och tusental.',
    searchTerms: [
      'bas-klossar', 'basklossar', 'ental', 'tiotal', 'hundratal', 'tusental', 
      'platsvärde', 'positionssystemet', 'växla tiotal', 'växla hundratal', 
      'block', 'stavar', 'plattor', 'kuber', 'addition', 'subtraktion', 'algoritm'
    ]
  },
  {
    type: WidgetType.HUNDRED_CHART,
    title: 'Hundrarutan',
    category: [MathArea.TAL],
    difficulty: Difficulty.LABORATIVE,
    description: 'Utforska talmönster, multiplikationstabeller och talorientering mellan 1 och 100.',
    searchTerms: [
      'hundrarutan', 'mönster', 'talmönster', 'tiohopp', 'multiplikation', 
      'multiplikationstabell', 'jämna tal', 'udda tal', 'primtal', 'taluppfattning', 
      'orientering', 'talsystemet', 'rader', 'kolumner'
    ]
  },
  {
    type: WidgetType.NUMBER_HOUSE,
    title: 'Tal-huset',
    category: [MathArea.TAL],
    difficulty: Difficulty.CONCRETIZING,
    description: 'Träna på taluppdelning, tiokompisar och talkompisar för de lägre talen.',
    searchTerms: [
      'tal-huset', 'talhuset', 'taluppdelning', 'tiokompisar', 'talkompisar', 
      'talfamiljer', 'addition', 'subtraktion', 'del-helhet', 'strukturerat räknande'
    ]
  },
  {
    type: WidgetType.NUMBER_BEADS,
    title: 'Pärlband',
    category: [MathArea.TAL],
    difficulty: Difficulty.LABORATIVE,
    description: 'Ett pärlband som är strukturerat i rött och vitt med fem- och tiogrupperingar upp till 100.',
    searchTerms: [
      'pärlband', 'pärlor', 'räkna', 'tio-gruppering', 'fem-gruppering', 
      'strukturera tal', 'tallinje', 'börja räkna', 'taluppfattning', 'avläsa tal'
    ]
  },
  {
    type: WidgetType.SHAPES,
    title: 'Former',
    category: [MathArea.GEOMETRI],
    difficulty: Difficulty.LABORATIVE,
    description: 'Konstruera tvådimensionella polygoner, jämför hörn och undersök geometriska egenskaper.',
    searchTerms: [
      'former', 'geometri', 'polygoner', 'månghörningar', 'kvadrat', 'rektangel', 
      'triangel', 'parallellogram', 'romb', 'hörn', 'sidor', 'omkrets', 'symmetri'
    ]
  },
  {
    type: WidgetType.FRACTION_BARS,
    title: 'Bråkstavar',
    category: [MathArea.TAL],
    difficulty: Difficulty.CONCRETIZING,
    description: 'Jämför bråkdelar med linjära bråkstavar för att upptäcka minsta gemensamma nämnare och ekvivalenser.',
    searchTerms: [
      'bråkstavar', 'bråkdelar', 'jämföra bråk', 'ekvivalenta bråk', 'stavar', 
      'gemensam nämnare', 'storleksordna bråk', 'andelar', 'helhet', 'konkretisera bråk'
    ]
  },
  {
    type: WidgetType.MATH_WORKSHOP,
    title: 'Matte-verkstad',
    category: [],
    difficulty: Difficulty.LABORATIVE,
    description: 'En kreativ experimentverkstad utrustad med fritt laborativt material för hypoteser och elevkort.',
    searchTerms: [
      'matte-verkstad', 'matteverkstad', 'problemlösning', 'laborera', 'hypotes', 
      'rita', 'laborativt material', 'elevkort', 'kreativ verkstad', 'diskutera'
    ]
  },
  {
    type: WidgetType.PRIME_BUBBLES,
    title: 'Prim-Bubblor',
    category: [MathArea.TAL],
    difficulty: Difficulty.ABSTRACTING,
    description: 'Faktorisera sammansatta tal i unika uppsättningar av primtalsbubblor genom faktorträd.',
    searchTerms: [
      'prim-bubblor', 'primbubblor', 'primtalsfaktorisering', 'delbarhet', 
      'faktorer', 'primtal', 'sammansatta tal', 'multiplikation', 'division', 
      'faktorträd', 'delare', 'aritmetikens fundamentalsats'
    ]
  },
  {
    type: WidgetType.CHANCE_GENERATOR,
    title: 'Slump-gen',
    category: [MathArea.STATISTIK],
    difficulty: Difficulty.LABORATIVE,
    description: 'Skapa och simulera slumpmässiga utfall med d6-tärningar, mynt eller anpassningsbara lyckohjul.',
    searchTerms: [
      'slump-gen', 'slumpgenerator', 'tärning', 'kasta tärning', 'singla slant', 
      'snurra hjul', 'lyckohjul', 'frekvensdiagram', 'relativ frekvens', 'sannolikhet'
    ]
  },
  {
    type: WidgetType.CLOCK,
    title: 'Klock-Labbet',
    category: [MathArea.TAL, MathArea.GEOMETRI],
    difficulty: Difficulty.LABORATIVE,
    description: 'Undersök kopplingen mellan analog och digital tid och ställ klockans timmar och minuter.',
    searchTerms: [
      'klock-labbet', 'klocklabbet', 'tid', 'analog klocka', 'digital klocka', 
      'timmar', 'minuter', 'sekunder', 'tidsomvandling', 'ställa klockan', 'dygn', 'urtavla'
    ]
  },
  {
    type: WidgetType.ECONOMY,
    title: 'Plånboken',
    category: [MathArea.SAMBAND],
    difficulty: Difficulty.CONCRETIZING,
    description: 'Öva på pengars värde och att betala eller ge växel med realistiska mynt och sedlar.',
    searchTerms: [
      'plånboken', 'pengar', 'sedlar', 'mynt', 'valuta', 'handla', 'växel', 
      'prislapp', 'budget', 'betala', 'konkret ekonomi', 'konsumtion', 'kronor'
    ]
  },
  {
    type: WidgetType.MULTI_MATCH,
    title: 'Multi-Matchen',
    category: [MathArea.ALGEBRA],
    difficulty: Difficulty.CONCRETIZING,
    description: 'Ett adaptivt pusselspel där du parar ihop olika matematiska framställningar och talmönster.',
    searchTerms: [
      'multi-matchen', 'multimatchen', 'pussel', 'representationer', 'matcha', 
      'ekvivalens', 'pusselspel', 'talmönster', 'algebraiska uttryck', 'figurmönster'
    ]
  },
  {
    type: WidgetType.TIERED_TASK,
    title: 'Nivå-Kortet',
    category: [MathArea.PROBLEMLÖSNING],
    difficulty: Difficulty.ABSTRACTING,
    description: 'Lös differentierade tankeutmaningar fördelade i trestegsraketer (Grön, Gul, Röd).',
    searchTerms: [
      'nivå-kortet', 'nivåkortet', 'problemlösning', 'ledtråd', 'trestegsraket', 
      'differentierad undervisning', 'svårighetsgrad', 'tankeuppgifter', 'kluringar'
    ]
  },
  {
    type: WidgetType.PREFIX_ELEVATOR,
    title: 'Prefix-Växlaren',
    category: [MathArea.SAMBAND],
    difficulty: Difficulty.CONCRETIZING,
    description: 'En visuell hiss som rör sig mellan storheter som kilo, hekto, deci, centi och milli.',
    searchTerms: [
      'prefix-växlaren', 'prefixväxlaren', 'prefix', 'enheter', 'vikt', 'volym', 
      'längd', 'växla enheter', 'hiss', 'tiopotenser', 'kilo', 'centi', 'milli', 'mätetal'
    ]
  },
  {
    type: WidgetType.POSITIONS_MACHINE,
    title: 'Positions-Maskinen',
    category: [MathArea.TAL],
    difficulty: Difficulty.CONCRETIZING,
    description: 'Laborera med talsorter från tusental till tusendelar, och undersök multiplikation/division med tiohopp.',
    searchTerms: [
      'positions-maskinen', 'positionsmaskinen', 'platsvärde', 'talsorter', 
      'ental', 'tiotal', 'hundratal', 'tiondelar', 'hundradelar', 'decimaltecken', 
      'tiohopp', 'multiplicera med 10 100 1000', 'dividera', 'skiftare'
    ]
  },
  {
    type: WidgetType.UNIT_STAIRCASE,
    title: 'Enhetstrappan',
    category: [MathArea.TAL, MathArea.GEOMETRI, MathArea.SAMBAND],
    difficulty: Difficulty.LABORATIVE,
    description: 'Klättra i trappan för att förstå hur enheter för meter, liter och gram omvandlas.',
    searchTerms: [
      'enhetstrappan', 'enhetsomvandling', 'trappa', 'meter', 'liter', 'gram', 
      'omvandla enheter', 'skala om', 'storheter', 'vikt', 'mätning'
    ]
  },
  {
    type: WidgetType.BASIC_STATISTICIAN,
    title: 'Bas-Statistikern',
    category: [MathArea.STATISTIK],
    difficulty: Difficulty.CONCRETIZING,
    description: 'Beräkna lägesmått som medelvärde, median, typvärde och visualisera dem i stapeldiagram.',
    searchTerms: [
      'bas-statistikern', 'basstatistikern', 'statistik', 'medelvärde', 'median', 
      'typvärde', 'variationsbredd', 'stapeldiagram', 'frekvenstabell', 'datamängd'
    ]
  },
  {
    type: WidgetType.MAGIC_SQUARE,
    title: 'Magiska Kvadraten',
    category: [MathArea.TAL],
    difficulty: Difficulty.CONCRETIZING,
    description: 'Ett logiskt sifferpussel där rader, kolumner och diagonaler ska matcha en förutbestämd magisk summa.',
    searchTerms: [
      'magiska kvadraten', 'magisk summa', 'sifferpussel', 'pussel', 'logik', 
      'rader', 'kolumner', 'diagonaler', 'addition', 'talmönster', 'hjärngympa'
    ]
  },
  {
    type: WidgetType.MATCHSTICK_RIDDLE,
    title: 'Tändstickor',
    category: [MathArea.ALGEBRA],
    difficulty: Difficulty.LABORATIVE,
    description: 'Lös geometriska och aritmetiska gåtor genom att flytta, ta bort eller lägga till tändstickor.',
    searchTerms: [
      'tändstickor', 'tändsticksgåta', 'pussel', 'ekvationer', 'logik', 
      'geometriska figurer', 'omvandla ekvation', 'kreativt tänkande', 'problemlösning'
    ]
  },
  {
    type: WidgetType.CENTIKUB_BOX,
    title: 'Centikub-Lådan',
    category: [MathArea.TAL, MathArea.GEOMETRI],
    difficulty: Difficulty.LABORATIVE,
    description: 'Bygg tredimensionella skapelser i ett isometriskt rutnät med valfria centikubblock, och beräkna volym och begränsningsarea.',
    searchTerms: [
      'centikub-lådan', 'centikublådan', 'centikub', '3d', 'isometrisk', 'vyer', 
      'volym', 'begränsningsarea', 'rymdgeometri', 'kuber', 'tredimensionell', 
      'bygga', 'block', 'figurer', 'ritning'
    ]
  },
  {
    type: WidgetType.SORTING_BOX,
    title: 'Sorteringsboxen',
    category: [MathArea.TAL, MathArea.GEOMETRI],
    difficulty: Difficulty.LABORATIVE,
    description: 'Sortera och klassificera olika färgade rymdgeometriska kroppar efter runda ringsällningar, hyllplan eller lådor.',
    searchTerms: [
      'sorteringsboxen', 'sortera', 'klassificera', 'mängdlära', 'färg', 'form', 
      'kategorier', 'attribut', 'sorteringsregler', 'hylla', 'lådor', 'venndiagram'
    ]
  }
];
