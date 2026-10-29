/**
 * LET OP: een project bestaat pas als het in deze lijst staat (`serieLijst`). Nieuwe mappen onder src/assets/portfolio/
 * (bijvoorbeeld experimenteel, oostblok reportage) leveren alleen foto's voor /portfolio en worden NOOIT
 * automatisch een project, pagina, kaart op /series, schema-item of route: de pagina's ([project].astro), /series, de
 * sitemap en het JSON-LD lezen alleen uit deze lijst, niet uit de mappen. (Deze lijst heette eerder werk.ts, naar /werk.)
 *
 * Series (projecten): één bron voor het overzicht /series (src/pages/series.astro) en de detailpagina's
 * (src/pages/[project].astro, foto's en indeling in src/lib/serie-fotos.ts; de omslag wordt alleen op /series gebruikt). Pauls projecten zijn precies deze negen
 * (zie .cursor/rules/paulbreuker-regels.mdc). /panoramas en /portfolio/portretten zijn geen projecten.
 *
 * Detailpagina: de foto's komen uit de map src/assets/portfolio/<slug>/ (hoofdletter- en leestekenongevoelig, dus
 * "Groeten uit lent" hoort bij groeten-uit-lent), op bestandsnaam gesorteerd; alt-teksten staan in src/data/alt-teksten.ts. Een project zonder foto krijgt geen pagina (en staat dus niet in de sitemap).
 *
 * - De volgorde van de lijst is de volgorde op de pagina (en in de JSON-LD). Wijzig alleen de volgorde hieronder.
 * - De href is "/" + slug (zie `serieHref`).
 * - `onderregel` is optioneel en wordt alleen op de kaart in /series getoond (niet op de detailpagina), en alleen als hij bestaat. Verzin geen tekst: jaartal en plaats of een
 *   korte omschrijving komen van Paul (TODO(paul) per project).
 * - Omslagfoto's: love-marriage, take-me-to-the-river en asty-mwaka gebruiken dezelfde bestanden als de homepage-sectie
 *   Projecten (src/assets/home/project-*.jpg); de overige de eerste foto (alfabetisch) uit src/assets/portfolio/<map>/.
 *   Een map met een bestand "omslag" of "cover" gaat voor (nu bestaat dat bij geen enkel project).
 * - Ontbreekt van een project elke foto, laat het dan uit de lijst: geen placeholder.
 */
import loveMarriage from '../assets/home/project-love-marriage.jpg';
import takeMeToTheRiver from '../assets/home/project-take-me-to-the-river.jpg';
import astyMwaka from '../assets/home/project-asty-mwaka.jpg';
import gaarkeuken from '../assets/portfolio/de-gaarkeuken/Gaarkeuken 01-min.jpg';
import tradities from '../assets/portfolio/tradities/breuker tradities 01-min.jpg';
import asfalt from '../assets/portfolio/Asfalt/L1039951.jpg';
import groetenUitLent from '../assets/portfolio/groeten-uit-lent/breuker lent 05-min.jpg';
import hetGezichtVanNijmegen from '../assets/portfolio/het-gezicht-van-nijmegen/008kl.jpg';
import oudeHonden from '../assets/portfolio/oude honden/rechts7.jpg';

export interface Serie {
  slug: string;
  titel: string;
  /** Optioneel, onder de titel op de kaart in /series. Op de detailpagina wordt hij niet getoond. Leeg of weggelaten: niet getoond. */
  onderregel?: string;
  omslag: ImageMetadata;
  /** Nederlandse, beschrijvende alt-tekst (wie/wat/waar) van de omslag. */
  alt: string;

  /** Alinea's van de introductie op de detailpagina (ik-vorm van Paul). Zonder tekst geen Introductie. */
  introductie?: string[];
  /** Eigen title en description voor de detailpagina. Standaard: "{titel} | Fotoserie door Paul Breuker". */
  seo?: { title?: string; description?: string };
  /** Link naar de bijbehorende commerciële pagina, in de doorlinkrij onder het raster. */
  commercieleLink?: { tekst: string; href: string };
  /** Alt-tekst per bestandsnaam (map van het project). Ontbreekt een bestand, dan geldt een algemene tekst. */
  altTeksten?: Record<string, string>;
}

export const serieHref = (slug: string): string => `/${slug}`;

/*
 * Per project hieronder: ontbrekende gegevens staan als TODO(paul). De detailpagina werkt zonder (een onderdeel dat
 * geen data heeft, wordt niet getoond). Alle altTeksten beschrijven wat te zien is; namen, plaatsen en jaartallen alleen als ze van Paul komen (zoals de bijschriften bij Tradities).
 */
export const serieLijst: Serie[] = [
  {
    slug: 'love-marriage',
    titel: 'Love & Marriage',
    onderregel: 'Bruiloften fotograferen, sinds 1992',
    introductie: [
      'Ik fotografeer bruiloften sinds 1992 en dat project loopt nog steeds. Een bruiloft fotograferen is moeilijk. Ik probeer clichés te vermijden en een eerlijke indruk van de dag te geven, met aandacht voor de onverwachte momenten.',
      'De serie volgt de hele dag, van de ochtend tot het feest, en ook de trouwauto hoort erbij.',
    ],
    seo: { description: 'Love & Marriage: bruiloften fotograferen sinds 1992. Een fotoserie van Paul Breuker over de hele dag, zonder clichés.' },
    omslag: loveMarriage,
    alt: 'Zwart-witfoto in een woonkamer: een vrouw in een witte trouwjurk strijkt de rok op een strijkplank, terwijl een man met ontbloot bovenlijf naast haar toekijkt.',
    commercieleLink: { tekst: 'Fotograaf voor je bruiloft', href: '/fotograaf-bruiloft' },
    // TODO(paul): alle alt-teksten controleren (bijvoorbeeld 'bruiloft 05': ik weet niet wat voor feest dit is; 'bruiloft 19': klopt het dat ze een baby wast?).
    altTeksten: {
      'bruiloft 02-min.jpg': 'Zwart-witfoto van een volle feestzaal: gasten dansen en zijn door de beweging deels wazig.',
      'bruiloft 04-min.jpg':
        'Een man in een donkere toga staat achter een tafel met een boek op een zandstrand aan het water. Twee mensen omhelzen elkaar; op de achtergrond ligt een boot.',
      'bruiloft 05-min.jpg':
        'Een groep vrouwen in kleurrijke hoofddoeken en feestkleding staat dicht bij elkaar. Rechts een jonge vrouw met een rijk versierde witte hoofdtooi; vooraan kijkt een meisje toe.',
      'bruiloft 07-min.jpg':
        'Een bruid in een witte jurk en een man in een donker pak zitten op een gele bank in een fel verlichte ruimte met een toonbank. Achter hen staan twee jongens bij speelautomaten.',
      'bruiloft 08-min.jpg':
        'Een bruid met sluier en een bruidegom staan met hun rug naar de camera voor een priester in een wit gewaad, die zijn hand opheft. Een assistent houdt een boekje voor hem.',
      'bruiloft 09-min.jpg':
        'Gasten in nette kleding staan tussen de graven op een begraafplaats. Een man omarmt een oudere vrouw.',
      'bruiloft 11-min.jpg':
        'Een bruid in een witte jurk zit op een bed en buigt zich over een liggende man; een tweede vrouw zit achter hen.',
      'bruiloft 14-min.jpg':
        'Twee vrouwen lachen bij het open raam van een auto. De ene draagt een strohoed met brede rand, de andere een parelketting en brengt haar hand naar haar gezicht.',
      'bruiloft 15-min.jpg':
        'Zwart-witfoto op een bosweg: een bruid in een lange witte jurk met een boeket staat bij een geopende auto, terwijl een man zich in de auto buigt.',
      'bruiloft 16-min.jpg':
        'Zwart-witfoto vanaf de achterbank van een auto: een man in pak met een corsage kijkt ernstig in de camera, naast hem zit een bruid met opgestoken haar, van achteren gezien.',
      'bruiloft 18-min.jpg':
        'Een bruid in een witte jurk met een lange sluier zit op het toilet, gezien door de open deur vanuit de gang.',
      'bruiloft 19-min.jpg':
        'Een vrouw in een bloemetjesjurk wast een baby in de gootsteen van een keuken en kijkt in de camera. Achter haar maakt een man een foto en staat een man in pak bij de deur.',
      'bruiloft 20-min.jpg':
        'Een bruid in een witte jurk wordt in een slaapkamer aangekleed. Een vrouw in een grijs vest helpt haar, een knielende vrouw schikt de tule rok en een meisje in een wit jurkje staat ertussen; rechts kijkt een vrouw in een witte jurk toe.',
      // TODO(paul): alt-teksten van 21 t/m 23 controleren (plaats en jaar van de foto's zijn niet bekend).
      'bruiloft 21-min.jpg':
        'Een jongen in een donker pak en een meisje in een wit jurkje zitten in een geopende zwarte oldtimer op een grasveld. Hij leunt peinzend met zijn hand tegen zijn mond, zij leunt met haar hoofd tegen de portierstijl; naast haar ligt een boeket.',
      'bruiloft 22-min.jpg':
        'Zwart-witfoto op een zandweg door het bos: een bruid met sluier en een bruidegom met corsage staan arm in arm bij een lichte auto met open kofferbak, terwijl een man op zijn hurken een band verwisselt.',
      'bruiloft 23-min.jpg':
        'Een man in een zwart pak met stropdas speelt op een groot koperen blaasinstrument, een sousafoon, voor een rustig, grijs water met palen in de verte.',
    },
  },
  {
    slug: 'take-me-to-the-river',
    titel: 'Take me to the river',
    onderregel: 'Binnenvaart als abstract schilderij, Waalbrug Nijmegen, 2016',
    introductie: [
      'In het voorjaar van 2016 fietste ik vanuit Lent over de Waalbrug naar mijn studio in Nijmegen om een nieuwe camera te testen. Vanaf de brug zag ik een schip naderen en ik fotografeerde het: de boeg met opspattend water, de lading geel zand, de kajuit, de sloep en een scooter aan dek.',
      "De vorm, de kleuren en de symmetrie van het beeld deden me denken aan een abstract schilderij. Zo begon de serie. Het boek telt 72 pagina's en bevat close-ups van de lading van binnenvaartschepen, die op abstracte schilderijen lijken.",
    ],
    seo: { description: 'Take me to the river: fotoserie en boek van Paul Breuker over binnenvaartschepen op de Waal, gezien als abstracte schilderijen.' },
    // TODO(paul): commercieleLink (welke commerciële pagina past bij deze serie?).
    omslag: takeMeToTheRiver,
    alt: 'Bovenaanzicht van een lang, smal laadruim van een binnenvaartschip, omringd door groen water: in het midden ligt donkere aarde met een smalle strook licht water ertussen.',
    // TODO(paul): alt-teksten controleren (ik weet niet wat de lading precies is).
    altTeksten: {
      'Take me to the river 03-min.jpg':
        'Bovenaanzicht van een laadruim met een berg lichtgrijs, korrelig materiaal tussen rode wanden.',
      'Take me to the river 04-min.jpg':
        'Bovenaanzicht van een laadruim met een donkerrode lading in afgeronde bulten op een lichte bodem.',
      'Take me to the river 05-min.jpg':
        'Bovenaanzicht van een leeg laadruim met een roestige, geelbruine vloer vol donkere vlekken.',
      'Take me to the river 06-min.jpg':
        'Bovenaanzicht van een smal, turquoise laadruim op groen water: een donkere lading ligt in twee hopen met een smalle lichte strook ertussen.',
      'Take me to the river 08-min.jpg':
        'Bovenaanzicht van een laadruim vol afgeronde bulten blauwgrijze, bijna zwarte lading.',
      'Take me to the river 09-min.jpg':
        'Bovenaanzicht van een laadruim met een grote, zwarte lading in afgeronde lobben.',
      'Take me to the river 10-min.jpg':
        'Close-up van drie bolle bergen lichtbruine, korrelige lading naast een blauwgrijze scheepswand.',
      'Take me to the river 15-min.jpg':
        'Bovenaanzicht van een laadruim vol rollen staaldraad, naast elkaar gestapeld.',
      'Take me to the river 3.jpg':
        'Bovenaanzicht van een blauwgroen laadruim met een lading lichtgele, korrelige bulten.',
    },
  },
  {
    slug: 'de-gaarkeuken',
    titel: 'De Gaarkeuken',
    onderregel: 'Gaarkeuken in Pskov, Rusland, begin jaren negentig',
    introductie: [
      'In het begin van de jaren negentig bezocht ik regelmatig de gaarkeuken in Pskov, in Rusland. Daar kregen mensen elke dag een warme maaltijd.',
      "Mijn portretten laten mensen zien zoals ze zijn, niet als een opgepoetste versie van de werkelijkheid: buren, vrienden die elkaar omhelzen, veteranen, mensen die het koud hebben en ouderen. De serie is uitgegeven als fotoboek van 44 pagina's, met een tekst van Frank Nellen.",
    ],
    seo: { description: 'De Gaarkeuken: portretten uit de gaarkeuken in Pskov, Rusland, begin jaren negentig. Fotoserie en boek van Paul Breuker.' },
    omslag: gaarkeuken,
    alt: 'Zwart-witportret van een oudere man met een zwarte baret en een jas met open kraag. Hij kijkt ernstig recht in de camera.',
    commercieleLink: { tekst: 'Portretfoto laten maken', href: '/portretfotos' },
    // TODO(paul): alt-teksten controleren.
    altTeksten: {
      'Gaarkeuken 01-min.jpg':
        'Zwart-witportret van een oudere man met een zwarte baret en een jas met open kraag. Hij kijkt ernstig recht in de camera.',
      'Gaarkeuken 02-min.jpg':
        'Zwart-witportret van een man met warrig haar en een grijze baard, in een jas met een bontkraag.',
      'Gaarkeuken 03-min.jpg':
        'Zwart-witportret van een oudere vrouw met een gestreepte hoofddoek. Ze heeft diepe rimpels en kijkt met een lichte glimlach opzij.',
      'Gaarkeuken 05-min.jpg':
        'Portret in kleur van een oudere vrouw met een oranje gebreide muts en een lichtblauwe jas, voor een lichte muur.',
      'Gaarkeuken 06-min.jpg':
        'Portret in kleur van een oudere vrouw met een rood-witte hoofddoek en een grijze jas.',
      'Gaarkeuken 07-min.jpg':
        'Portret in kleur van een oudere vrouw met een kleurrijke hoofddoek, een oranje sjaal en een bruine wollen jas.',
      'Gaarkeuken 08-min.jpg':
        'Portret in kleur van een oudere vrouw met een groen en paars gekleurde hoofddoek en een blauwe jas. Ze kijkt ernstig in de camera.',
      'Gaarkeuken 09-min.jpg':
        'Zwart-witportret van een man met een uniformpet met embleem, een geruit overhemd en een donkere jas.',
      'Gaarkeuken 10-min.jpg':
        'Zwart-witportret van een oudere vrouw met een witte, pluizige muts en een sjaal om haar hals.',
      'Gaarkeuken 12-min.jpg':
        'Portret in kleur van een lachende vrouw met een roze-wit gestippelde hoofddoek en een lichte gebreide trui.',
      'Gaarkeuken 13-min.jpg':
        'Zwart-witfoto van een oudere man met pet, bril en baard in een lange jas. Hij staat voor een vervallen muur en houdt zijn hand tegen zijn borst.',
      'Gaarkeuken 14-min.jpg':
        'Zwart-witfoto van een oudere vrouw in een vest en bloemetjesrok. Ze staat voor een vervallen muur met een plastic tas in haar hand.',
      'Gaarkeuken 16-min.jpg':
        'Zwart-witfoto van een oudere man met een hoed en een colbert. Hij staat voor een vervallen muur met een gevlochten tas in zijn hand.',
      'Gaarkeuken 25-min.jpg':
        'Zwart-witportret van een oudere vrouw met een gehaakte hoed en een donkere jas met grote kraag. Ze kijkt rustig in de camera.',
    },
  },
  {
    slug: 'tradities',
    titel: 'Tradities',
    onderregel: 'Tradities en rituelen, gefotografeerd met een Widelux',
    introductie: [
      'Dit zijn traditionele gebruiken, rituelen en volksfeesten in Nederland en daarbuiten, gefotografeerd met een Widelux-panoramacamera. Van Semana Santa in Sevilla en carnaval in Maastricht tot de Vierdaagse in Nijmegen en de Romería del Rocío.',
      'Van deze serie bestaat één boek, van 60 × 28 cm, met originele prints op barytpapier. Je kunt het op verzoek bij mij inzien.',
    ],
    seo: { description: 'Tradities: fotoserie van Paul Breuker over rituelen en volksfeesten in Nederland en daarbuiten, gefotografeerd met een Widelux-panoramacamera.' },
    // TODO(paul): commercieleLink (welke commerciële pagina past bij deze serie?).
    omslag: tradities,
    // TODO(paul): alt controleren en plaats/jaar noemen als je dat wilt (nu alleen beschreven wat te zien is).
    alt: 'Zwart-witpanorama op een plein met bakstenen gevels: een rij meisjes in donkere uniformen met een stok in de hand kijkt in de camera, rechts staat een oudere man met zijn armen over elkaar.',
    // TODO(paul): alt-teksten controleren (jaartallen ontbreken; 'tradities 02' en 'tradities 12' zijn niet met zekerheid herkend of gekoppeld).
    altTeksten: {
      'breuker tradities 01-min.jpg':
        'Dansmariekes in Nijmegen: een rij meisjes in donkere uniformen met een stok in de hand kijkt in de camera, rechts staat een oudere man met zijn armen over elkaar.',
      'breuker tradities 02-min.jpg':
        'Zwart-witpanorama van een drukke straat: een man met helm en zonnebril kijkt in de camera, achter hem zit iemand op een motor. Rechts lopen twee jonge vrouwen langs een kraam met een parasol.',
      'breuker tradities 06-min.jpg':
        'Carnaval in Maastricht: een stoet verklede mensen met vaandels en spandoeken. Links blaast een man met een hoge witte puntmuts op een hoorn.',
      'breuker tradities 10-min.jpg':
        'Elfstedentocht in Franeker: schaatsers op een bevroren water, met rechts een molen en langs de oever een grote menigte.',
      'breuker tradities 12-min.jpg':
        'Mariaprocessie in Nijmegen: mannen in witte gewaden op een plein bij een oude stenen muur. Een van hen draagt een staf; achter hen zitten toeschouwers.',
      'breuker tradities 13-min.jpg':
        'Paardenmarkt in Elst: veel paarden staan dicht bij elkaar en rechts kijkt een man met hoed en lange jas in de camera.',
      'breuker tradities 15-min.jpg':
        'Romería del Rocío: pelgrims met hoeden en takken in de hand trekken in mist en tegenlicht te voet en te paard, onder wie twee vrouwen in wijde gestippelde jurken.',
      'breuker tradities 16-min.jpg':
        'Semana Santa in Sevilla: een man in een puntkap en gewaad staat in de deuropening van een kerk tussen twee jongens in uniform, voor hen kijken mannen in pak toe.',
      'breuker tradities 17-min.jpg':
        'Romería del Rocío: een grote groep mensen langs en in een rivier onder een bewolkte lucht.',
      'breuker tradities 18-min.jpg':
        'Demonstratie van studenten in Belgrado: een dichte menigte op een plein voor grote kantoorgebouwen, met hier en daar een bord boven de hoofden.',
    },
  },
  {
    slug: 'asfalt',
    titel: 'Asfalt',
    onderregel: 'Gerepareerd asfalt als abstracte kunst',
    introductie: [
      'Gerepareerde gaten in het asfalt zie ik als ongeplande, abstracte kunstwerken op straat.',
    ],
    seo: { description: 'Asfalt: een fotoserie van Paul Breuker over gerepareerde gaten in het wegdek, gezien als ongeplande abstracte kunstwerken op straat.' },
    // TODO(paul): commercieleLink (welke commerciële pagina past bij deze serie?).
    omslag: asfalt,
    // TODO(paul): alt controleren; het is een abstracte close-up en ik weet niet wat de bedoeling van de foto is. De omslag is
    // Asfalt/L1039951.jpg: een gekozen vervanger voor het oude L1039810-min-2.jpg (zie scripts/foto-mapping.md).
    alt: 'Close-up van asfalt met links een roodbruin vlak met witte driehoeken en een brede zwarte teerstrook die van boven naar beneden loopt.',
  },
  {
    slug: 'asty-mwaka',
    titel: 'Asty Mwaka',
    onderregel: 'Drie jaar portretten van één persoon',
    introductie: [
      'Asty verscheen voor het eerst als popster: in een lichtblauw spijkerpak, met een grote bos krullen en een blauwe zonnebril.',
      "Drie jaar lang kwam Asty elke twee weken naar mijn fotostudio. Zo ontstond een serie portretten van één persoon met 64 verschillende gezichten. De serie verscheen als glossy magazine van 64 pagina's.",
    ],
    seo: { description: 'Asty Mwaka: drie jaar lang portretten van één persoon in 64 gezichten. Fotoserie en magazine van Paul Breuker.' },
    // TODO(paul): commercieleLink (welke commerciële pagina past bij deze serie?).
    omslag: astyMwaka,
    alt: 'Portret van een jonge vrouw met een volle afrokrullen, zilverkleurige oogschaduw en paarse lippenstift, in een glanzend lichtblauw shirt. Ze kijkt ernstig recht in de camera.',
  },
  {
    slug: 'groeten-uit-lent',
    titel: 'Groeten uit Lent',
    onderregel: 'Zestien jaar Lent, Nijmegen',
    introductie: [
      'Zestien jaar lang fotografeerde ik Lent en de inwoners van het dorp. Ik zag Lent veranderen van een tuindersdorp in een hip stadsdeel van Nijmegen.',
      "De serie bestaat uit verdwenen plekken, huiskamers en portretten van Lentenaren. Het fotomagazine Groeten uit Lent telt 148 pagina's met foto's en interviews.",
    ],
    seo: { description: 'Groeten uit Lent: zestien jaar fotograferen in Lent, van tuindersdorp tot stadsdeel van Nijmegen. Fotoserie en magazine van Paul Breuker.' },
    // TODO(paul): commercieleLink (welke commerciële pagina past bij deze serie?).
    omslag: groetenUitLent,
    alt: 'Een half gesloopt huis tussen het puin, met een gele graafmachine en een man in een blauwe overall op de achtergrond, onder een grijze lucht.',
    // TODO(paul): alt-teksten controleren.
    altTeksten: {
      'breuker lent 05-min.jpg':
        'Een half gesloopt huis tussen het puin, met een gele graafmachine en een man in een blauwe overall op de achtergrond, onder een grijze lucht.',
      'breuker lent 07-min.jpg':
        'Het interieur van een vervallen kas met kapotte ruiten, hangende plastic folies in het dak en rechts een stapel planken.',
    },
  },
  {
    slug: 'het-gezicht-van-nijmegen',
    titel: 'Het gezicht van Nijmegen',
    onderregel: 'Een groot masker, van scheepswerf Gelria naar de Waal',
    introductie: [
      'Ik volgde hoe een groot masker werd gemaakt, van de bouw bij scheepswerf Gelria in Nijmegen tot de tocht over de Waal.',
    ],
    seo: { description: 'Het Gezicht van Nijmegen: de bouw van een groot masker bij scheepswerf Gelria en de tocht over de Waal, gefotografeerd door Paul Breuker.' },
    // TODO(paul): commercieleLink (welke commerciële pagina past bij deze serie?).
    omslag: hetGezichtVanNijmegen,
    alt: 'Een reusachtig metalen gezicht met een versierde band om het hoofd staat in een grote industriële hal, waar twee werkers op de vloer bezig zijn.',
  },
  {
    slug: 'oude-honden',
    titel: 'Oude honden',
    onderregel: 'Reportage over de ouder wordende hond',
    introductie: [
      'Door de jaren heen heb ik een bijzondere fascinatie ontwikkeld voor het fotograferen van oude honden. In deze reportage leg ik de kwetsbare, maar krachtige pracht van de ouder wordende hond vast. Elke grijze haar en elke blik vertelt een eigen verhaal van een lang en trouw hondenleven.',
      'Dit doorlopende project is onlangs bekroond met een eigen boek, waarin al deze prachtige senioren een blijvende plek hebben gekregen.',
    ],
    seo: { description: 'Oude honden: een doorlopende fotoreportage van Paul Breuker over de kwetsbare, maar krachtige pracht van de ouder wordende hond. Nu ook als boek.' },
    // TODO(paul): commercieleLink (welke commerciële pagina past bij deze serie?) en een link naar /boek zodra het boek een eigen plek heeft.
    omslag: oudeHonden,
    // TODO(paul): alt-teksten controleren (de bestaande teksten staan in src/data/alt-teksten.ts); jaartal en plaats ontbreken.
    alt: 'Een grijze, krullende hond met een lichtbruine snuit zit op een klinkerpad tussen planten en een wit beeld van een gans.',
  },
];
