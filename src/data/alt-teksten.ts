/**
 * Alle alt-teksten van de foto's onder src/assets/portfolio, op pad ("<map>/<bestand>", precies zoals de map heet).
 *
 * Eén gedeeld bestand voor /portfolio, /portfolio/portretten en de projectpagina's:
 *  - de portretten (src/data/portretten.ts) staan hier onder `portretten/…`;
 *  - de alt-teksten per project uit src/data/series.ts (`altTeksten`, op bestandsnaam) gelden ook voor /portfolio;
 *  - de projectmappen die na de vervanging van de foto's nieuwe bestanden hebben, en de mappen zonder project
 *    (experimenteel, oostblok reportage, oude honden, promoties), staan hieronder.
 *
 * Regels: beschrijf wat je ziet (wie, wat, waar), verzin geen namen, geen keyword stuffing, geen twee gelijke teksten,
 * nooit een lege tekst. Foto's zonder tekst krijgen de neutrale terugvaltekst van `altVoor` ("Foto uit de serie {titel}")
 * en een waarschuwing in de build. De mapping oud → nieuw staat in scripts/foto-mapping.md: bij "zelfde foto" is de
 * oude alt-tekst overgenomen (Asfalt/L1039999.jpg, asty-mwaka/054.jpg, het-gezicht-van-nijmegen/008kl.jpg).
 *
 * TODO(paul): alle teksten laten controleren; vooral bij experimenteel (schilderijen en tekeningen: van wie zijn ze?),
 * oostblok reportage (plaats en jaar) en de mapping "onzeker"/"gekozen vervanger" in scripts/foto-mapping.md.
 */
import { serieLijst } from './series';

const PORTRETTEN: Record<string, string> = {
  '01070.jpg':
    'Zwart-witportret van een tienermeisje met lang, gevlochten haar in een donkere trui en een spijkerrok. Ze staat voor een donkere heg en kijkt recht in de camera.',
  // TODO(paul): bron is maar 412 × 607 px en de bestandsnaam vraagt om een credit aan palette.fm (kleurbewerking):
  // controleer of die credit nodig is en lever een grotere bron aan.
  '01_xusXd__please_credit[palette.fm].jpg':
    'Gekleurd portret van een oude vrouw met een groenblauwe hoofddoek, een zwart vest en bloemenmouwen. Ze staat met gevouwen handen voor een stenen muur.',
  '04-7A-2.jpg':
    'Zwart-witfoto van een man in een donker pak en een vrouw met een lichte hoed en vest, arm in arm op straat voor een verweerde muur.',
  '05-17A-2.jpg':
    'Zwart-witfoto van twee vrouwen die arm in arm voor een muur staan, de ene met een handtas en de andere met een mand.',
  '09-09-2.jpg':
    'Zwart-witfoto van een man in een lange jas die op een stoel zit, met twee krukken tegen de muur naast hem.',
  '10-28-2.jpg':
    'Zwart-wit close-up van een oude vrouw met een gestreepte hoofddoek en een gezicht vol rimpels. Ze lacht lichtjes.',
  '1018.jpg':
    'Zwart-witfoto van een jongen met een pet die met zijn armen op de hals van een gitaar leunt, tegen een zwarte achtergrond.',
  '107A2013.jpg':
    'Man met een grijze baard en een gouden kroon met punten. Twee gouden handen liggen om zijn gezicht, achter hem is een houten wand.',
  '107A204635.jpg':
    'Man met een lange grijze baard in een kostuum van groene veren met een grote oranje snavel, tegen een donkere achtergrond.',
  '107A2934.jpg':
    'Meisje met een krans van roze en blauwe bloemen in haar blonde haar en een lichtblauwe jurk, voor een roodroze muur.',
  '107A4529.jpg':
    'Meisje met donker haar tot op haar schouders en een donkerblauw shirt met bloemetjes. Achter haar is een raam onscherp te zien.',
  '107A8379.jpg':
    'Oude vrouw met een bril en een groenblauw geruit hemd. Ze kijkt zacht lachend in de camera, de achtergrond is licht en onscherp.',
  '11-44-2.jpg':
    'Zwart-witportret van een oudere man met een uniformpet, een jasje en een geruit overhemd. Hij kijkt streng in de camera.',
  '12.jpg':
    'Zwart-witfoto van een vrouw in een lange donkere jas en met een hoed, die naast een autowrak en een stapel hout staat.',
  '13.jpg':
    'Zwart-witfoto van een jonge vrouw in een donzige jas die een peuter op haar arm draagt, voor een vrachtwagen.',
  '19269.jpg':
    'Zwart-witfoto van drie mensen voor een donkere houten poort: een vrouw in een bloemenrok, een man in een donker pak en een oudere man met een pet.',
  '22366.jpg':
    'Zwart-witportret van een man met een pet, lang haar en een mouwloos shirt, met getatoeëerde armen en een blikje in zijn hand, tegen een zwarte achtergrond.',
  '23066.jpg':
    'Zwart-witportret van een oudere vrouw met kort krullend haar in een jas, met een zwarte handtas voor zich, tegen een zwarte achtergrond.',
  '2m.jpg':
    'Zwart-witgroepsfoto van drie vrouwen en een baby, dicht bij elkaar voor een donkere achtergrond.',
  '3.jpg':
    'Zwart-witportret van een oudere vrouw met een getinte bril, kettingen en een blouse met bloemenprint, tegen een zwarte achtergrond.',
  // TODO(paul): controleer of dit drie mannen zijn (twee dragen een pet) en wat de plek is (houten schuur?).
  '45.jpg':
    'Zwart-witfoto van drie mannen naast elkaar voor een houten schuur, in een zwarte rand.',
  '58m.jpg':
    'Zwart-witfoto van een oude vrouw met een hoofddoek en een donkere jas, die met haar handen op haar knieën voor een muur zit.',
  'Bo.jpg':
    'Jonge vrouw met lang blond haar in een beige uniformhemd met veel insignes en een groene halsdoek, voor een groenblauwe achtergrond.',
  'DSC02234.jpg':
    'Meisje met donker haar in twee staartjes en een witte jurk met kant, buiten voor een groene tuin.',
  'DSC02275.jpg':
    'Meisje met twee krullende haarbollen en een witte bloem in haar haar, in een donkerblauw hemd, voor groen blad.',
  'DSC02372.jpg':
    'Man met korte vlechtjes, een kleine baard en een wit overhemd, buiten voor groene bomen.',
  'DSC03479-2.jpg':
    'Jonge man met donker haar en een korte baard, in een donker pak met stropdas. Achter hem schemeren warme lichtjes.',
  'DSC03609-2.jpg':
    'Jonge man met lichtbruin haar in een donker pak met een gestreepte stropdas, voor een donkere ruimte waarin iemand in een blauw pak onscherp te zien is.',
  'DSC03654-2.jpg':
    'Oudere man met wit haar, een witte baard en een bril, in een overhemd met fijn patroon. Achter hem zijn warme lichtvlekken onscherp te zien.',
  'DSC03808.jpg':
    'Lachende man in een rood jasje met een rode strik en een puntmuts van zilver en rood, voor een kleurrijke onscherpe achtergrond.',
  'DSC03911.jpg':
    'Man met een bril en een puntmuts van zilver en rood, in een zwart jasje met insignes en een rode strik, voor een onscherpe oranje achtergrond.',
  'DSC04309.jpg':
    'Jongen met golvend blond haar en een zwart shirt. Hij kijkt rustig in de camera, de achtergrond is lichtgrijs en onscherp.',
  'DSC04527.jpg':
    'Kind met warrig lichtbruin haar in een donkergroene trui. De achtergrond is licht en onscherp.',
  'DSC05053.jpg':
    'Vrouw met een grote bril, rode lippenstift en een lichtblauw overhemd, haar haar opgestoken. Achter haar staan planten op een wit rek.',
  'DSC05220-2.jpg':
    'Jongen met donker krullend haar in een grijze hoodie, voor een onscherp raam met lichte kleurvlakken.',
  'DSC06109.jpg':
    'Jonge man in een oranjerode hoodie die zijn mond scheef trekt en recht in de camera kijkt, tegen een zachte beige achtergrond.',
  'DSC07080.jpg':
    'Vrouw met lang blond haar, lippenstift en een donker glinsterend topje. Achter haar is een warm interieur onscherp te zien.',
  'DSC07644-2.jpg':
    'Jonge man met bruin haar in een marineblauw pak met gestreepte stropdas, voor een onscherpe zwart-witte achtergrond.',
  'DSC07678-2.jpg':
    'Jonge man met bruin, naar achteren gekamd haar in een donker pak met gestreepte stropdas. Achter hem hangt een onscherpe banner met de tekst 100 jaar.',
  'DSC07743-2.jpg':
    'Jonge man met blond haar in een grijs pak en wit overhemd, voor een onscherpe achtergrond met oranje patroon.',
  'DSC08072.jpg':
    'Vrouw met een blauw-oranje gebloemde hoofddoek en een donkere blazer, voor een onscherp warm interieur.',
  'DSC08165.jpg':
    'Lachende vrouw met een zwarte hoofddoek, een gouden ketting en een bovenstuk met luipaardprint, voor een donker en warm onscherp interieur.',
  'DSC08230.jpg':
    'Man met donker, naar achteren gekamd haar en een verzorgde baard in een zwart overhemd. Hij kijkt ernstig in de camera.',
  'DSC08944.JPG':
    'Jongen in een grijs-wit sweatvest met zijn handen in zijn zakken, die voor een rolluik met blauwe graffiti staat.',
  'DSC08946.JPG':
    'Meisje met blond haar in roze en paarse kleding, voor een rolluik vol blauwe en roze graffiti.',
  'DSC09096.JPG':
    'Meisje met een groene pet, een donkerblauw vest, een broek met camouflageprint en rode gympen, voor een rolluik met beschilderde bandlogo’s.',
  'DSC09106.JPG':
    'Kind in een blauw jasje en een groene pet voor een zwart rolluik met een groot wit Ramones-logo.',
  'DSC09109.JPG':
    'Jongere in een spijkerjasje die voor hetzelfde zwarte rolluik met het witte Ramones-logo staat.',
  'Johan als Nar (1).jpg':
    'Man verkleed als nar, met een rood-blauwe puntmuts en een bruin kostuum, die breed lacht tegen een zwarte achtergrond.',
  // TODO(paul): controleer deze beschrijving; het is een niet-gestileerd moment (ziekenhuisbed), gebruik je deze foto hier?
  'R1177878-2.jpg':
    'Een jongetje ligt in een ziekenhuisbed met een infuus en een knuffel, een jongen in een groen shirt zit naast hem met zijn kin op zijn hand.',
  '_MG_0926.jpg':
    'Jonge man met een brede lach in een grijs-blauw jack met capuchon en een beige muts.',
  '_MG_1353.jpg':
    'Meisje met blond haar in twee staartjes met roze elastiekjes, in een rode jurk met stippen. Ze kijkt opzij in de camera.',
  '_MG_2665.jpg':
    'Oudere vrouw met wit haar en een klein donker kapje met kralen, in een zwart topje met stippen, voor een lichte betegelde wand.',
  '_MG_7443.jpg':
    'Lachend meisje met lang blond haar in een groen geruit overhemd, voor een warm onscherp interieur.',
  'a001.jpg':
    'Zwart-witfoto van een jonge vrouw en een jonge man met lang haar, samen in een steegje met graffiti op de muren.',
  'a004.jpg':
    'Zwart-witfoto van een man in een versleten jas die zijn arm uitstrekt en naar de camera wijst, voor een muur met graffiti.',
  'a006.jpg':
    'Zwart-witportret van een jonge man met krullend haar en een kralenketting, voor een muur met graffiti.',
  'a007.jpg':
    'Zwart-witportret van een jongere met een ronde bril, een bontachtige hoed en een leren jas, voor een deur met graffiti.',
  'a010.jpg':
    'Zwart-witportret van een glimlachende man met kort haar in een overhemd met patroon, voor een witte muur met graffiti.',
  'a011.jpg':
    'Zwart-witportret van een persoon met lange dreadlocks onder een gebreide muts, voor een muur met graffiti.',
  'a012.jpg':
    'Zwart-witportret van een jonge persoon met een ronde bril en een sjaal, die een wolk rook of damp uitblaast, voor een muur met graffiti.',
  // TODO(paul): bron is maar 512 × 768 px; lever een grotere versie aan.
  'a028.jpg':
    'Jonge vrouw met gevlochten haar in een oranje trui, voor een wand met kleurrijke tekeningen van zeedieren.',
  // TODO(paul): bron is maar 512 × 768 px; lever een grotere versie aan.
  'a031.jpg':
    'Jonge vrouw met lange paarszwarte vlechten, rode lippenstift en een donkere trui, tegen een neutrale achtergrond.',
  'aart.jpg':
    'Jonge man in een oranjerode hoodie die zijn lippen tuit en verbaasd kijkt, tegen een zachte beige achtergrond.',
  'beppy.jpg':
    'Oudere vrouw met wit-blond haar, een rood jasje en een parelketting, voor onscherpe witte bloemen.',
  'blad-07-06 (20A-21)1.jpg':
    'Zwart-witfoto van een man met een bontmuts en een versleten jas die een foto van een persoon voor zich vasthoudt, met een open water achter hem.',
  'blad-08-15 (40-40A)3.jpg':
    'Zwart-witfoto van een jonge vrouw met donker haar onder een hoofddoek, in een lichte jas, die zittend in de camera kijkt.',
  'dia-007.jpg':
    'Oude vrouw met een rood gewikkelde hoofdband, een jasje met bloemenprint en een roze sjerp om haar middel, in een gele deuropening.',
  // TODO(paul): controleer deze beschrijving; het lijkt een straatbeeld met een grote foto van een pasgeboren baby erboven.
  'josephine.jpg':
    'Een meisje met een zwarte hoed en een man met baard en hoed staan voor een graffitimuur, onder een grote foto van een pasgeboren baby in de handen van een verloskundige.',
  'kk65.jpg':
    'Oudere vrouw met een bril en wit haar die peinzend haar hand voor haar mond houdt.',
  'led-15.jpg':
    'Lachend meisje met lang krullend blond haar in een shirt met de tekst Young, tegen een zwarte achtergrond.',
  'mf-19 (7).jpg':
    'Zwart-witfoto van een oude vrouw met een muts, een gebreid vest en een geruite rok, voor een stenen muur.',
  'mf-21 (17)47.jpg':
    'Zwart-witfoto van een jongen in een grof gebreide trui die voor een tractor staat.',
  'neg-002b 2.jpg':
    'Oudere vrouw met een lichtblauwe hoed, een jasje met bloemenprint, een gele rok en rode sokken, die voor een gele muur staat.',
  'oma en 52.jpg':
    'Oude vrouw in een fauteuil in een woonkamer, met een baby in een gestreept pakje op schoot.',
  'teije 2.jpg':
    'Zeer oude man met warrig wit haar in een lichtblauwe trui over een blauw overhemd. Hij kijkt vriendelijk in de camera.',
  'tled-1.jpg':
    'Zwart-witportret van een jonge vrouw met donker omrande ogen en haar in staartjes, tegen een zwarte achtergrond.',
  'trees+joris.jpg':
    'Een oudere man met een gekleurde pet en een oudere vrouw die haar armen om hem heen slaat, allebei lachend, in een keuken.',
};

/** Asfalt (src/assets/portfolio/Asfalt/): abstracte close-ups van gerepareerd wegdek. */
const ASFALT: Record<string, string> = {
  'DSC01106.jpg': 'Close-up van asfalt met een witte streep, waarover de schaduw van een persoon en een kronkelende donkere lijn lopen.',
  'L1039807.jpg': 'Close-up van grijs asfalt met een donkere, kronkelende lijn en een roze-grijze lijn die elkaar kruisen.',
  'L1039914.jpg': 'Close-up van roodbruin asfalt met een donkergroene lijn in de vorm van een letter R en een lichte lijn die er schuin overheen loopt.',
  'L1039939.jpg': 'Close-up van grijs asfalt met een zwarte teerlijn die bovenaan een vierkante vorm maakt en naar beneden uitloopt, onder witte driehoeken.',
  'L1039949.jpg': 'Close-up van asfalt met een donkere teerlijn die onderaan een kleine lus maakt, onder een roodbruin vlak.',
  'L1039951.jpg': 'Close-up van asfalt met links een roodbruin vlak met witte driehoeken en een brede zwarte teerstrook die van boven naar beneden loopt.',
  'L1039953.jpg': 'Close-up van grijs asfalt met bovenin een putdeksel en een zwarte teerlijn die omlaag loopt, naast een witte streep.',
  'L1039954.jpg': 'Close-up van asfalt met twee witte strepen die naar boven toe samenkomen, met een zwarte teerlijn ertussen.',
  'L1039970.jpg': 'Close-up van donker asfalt met een witte streep en een web van zwarte lijnen dat een driehoekige vorm maakt.',
  'L1039983.jpg': 'Close-up van grijs asfalt met een teerlijn die een reeks lussen en rechthoeken vormt, naast een witte streep.',
  'L1039989.jpg': 'Close-up van asfalt met een donkere lijn die bovenaan een stervorm maakt, als een lange, smalle figuur omlaag loopt en onderaan eindigt in een druppel.',
  'L1039991.jpg': 'Close-up van grijs asfalt met twee vierkante reparatievlakken die door een blauwgrijze, buigende lijn zijn verbonden.',
  'L1039994.jpg': 'Close-up van asfalt met een groot, donker en vierkant reparatievlak waaronder een lichte lijn naar beneden loopt.',
  'L1039999.jpg': 'Close-up van grijs asfalt met een donkere, kronkelende lijn met een kleine lus bovenaan en een grote boog eronder.',
  'L1040007.jpg': 'Close-up van asfalt met een lichtgrijs, schildvormig reparatievlak waaruit een donkere lijn naar linksonder loopt.',
  'L1040017.jpg': 'Close-up van asfalt met een donkere lijn die zich vertakt en in twee takken eindigt in een ronde, donkere vlek.',
  'L1062089.jpg': 'Close-up van grofkorrelig asfalt met een groot, donker rechthoekig reparatievlak en bovenin een blauwgrijze lijn.',
  'L1062111.jpg': 'Close-up van grofkorrelig asfalt met een witte streep en daaromheen een dunne, donkere kronkellijn.',
  'L1062117.jpg': 'Close-up van asfalt met een donkere, kronkelende lijn die uitkomt in een groot, donker vlak rechts onderin.',
  'L1062121.jpg': 'Close-up van asfalt met een lange teerlijn die een grote rechthoek omlijnt, met onderaan een donker vlak.',
  'L1062133.jpg': 'Close-up van grofkorrelig asfalt met teerlijnen die twee lussen en een kleine ronde vorm vormen.',
  'L1062143.jpg': 'Close-up van asfalt met een dunne, donkere scheur die zich onderaan in twee takken splitst.',
  'L1062161.jpg': 'Close-up van asfalt met een witte streep, daarboven een kluwen van donkere teerlijnen met ronde vormen en een klein, donker vlakje.',
  'L1062166.jpg': 'Close-up van asfalt met bovenin een grijs, rechthoekig vlak en daaronder donkere teerlijnen die ronde vormen en twee donkere vlekken maken.',
};

/** Asty Mwaka (src/assets/portfolio/asty-mwaka/): portretten. De vier oude bestanden staan in series.ts (zie scripts/foto-mapping.md). */
const ASTY_MWAKA: Record<string, string> = {
  '004 2.jpg': 'Portret van een vrouw met een oranje maskerade-masker met veren en een glinsterende rand, in warm oranje licht tegen een donkere achtergrond.',
  '005.jpg': 'Portret van een jonge vrouw met lang zwart haar in een groene jas en een geel shirt met opdruk, voor een kleurrijk schilderij.',
  '032.jpg': 'Close-up portret van een jonge vrouw met een kleurrijke hoofddoek met een geometrisch patroon, gouden oorringen en rode lippenstift, voor een witte achtergrond.',
  '036.jpg': 'Portret van een jonge vrouw met lange, donkere vlechten met paarse accenten, rode lippenstift en een zwarte trui, voor een lichte muur.',
  '037.jpg': 'Portret van een jonge vrouw met dikke zwarte twists, rode lippenstift, gouden kettingen en een blouse met luipaardprint.',
  '040.jpg': 'Portret van een lachende jonge vrouw met een zwarte hoed over een blauwgroene hoofddoek en een versierde jas, voor een houten wand.',
  '054.jpg': 'Portret van een jonge vrouw met kort, krullend kastanjebruin haar, grote ronde oorringen, rode lippenstift en een grijze coltrui.',
  '107A5637.jpg': 'Portret van een jonge vrouw met lang zwart haar, grote oorhangers, felroze lippenstift en een zwarte top met ruches, voor een lichtgrijze achtergrond.',
  'a019.jpg': 'Portret van een jonge vrouw met lang, glad bruin haar met lichtere uiteinden, een rode hoed en een zwarte jas met bontkraag.',
  'a023.jpg': 'Portret van een jonge vrouw met afrokrullen in een zwart leren jasje en een gestreept shirt, voor een donkere achtergrond met een lijst.',
  'a025.jpg': 'Portret van een jonge vrouw met afrokrullen in een rode hoodie met een gouden ketting, voor een lijst aan de muur.',
  'a027.jpg': 'Portret van een jonge vrouw met lang, krullend bruin haar, een zwart jasje en een turquoise topje, voor een onscherpe achtergrond.',
  // TODO(paul): de bestandsnaam noemt een bruiloft en een kapselkoningin; controleer wat hier te zien is.
  'bruiloft kapselkoningin Asty, .jpg': 'Portret van een vrouw met opgestoken zwart haar, een bloemetje in het haar, uitgesproken make-up en een lichte blouse met luipaardprint, voor een lichte muur.',
};

/** Het gezicht van Nijmegen (src/assets/portfolio/het-gezicht-van-nijmegen/). */
const HET_GEZICHT_VAN_NIJMEGEN: Record<string, string> = {
  '003kl.jpg': 'Een groot wit masker, half bekleed, met een steiger ernaast in een donkere scheepswerfhal.',
  '004kl.jpg': 'Een groot, goudkleurig gezicht in profiel op de vloer van een scheepswerfhal, met op de achtergrond een schip.',
  '005kl.jpg': 'Een groot, goudbruin gezicht van voren gezien in een scheepswerfhal, met een schip erachter en een rode doek op de vloer.',
  '006kl.jpg': 'Een groot, grijs metaalkleurig gezicht met een ladder ertegenaan in een lichte scheepswerfhal, met een schip op de achtergrond.',
  '008kl.jpg': 'Een reusachtig metalen gezicht met een versierde band om het hoofd staat in een grote industriële hal, waar twee werkers op de vloer bezig zijn.',
  '0016.jpg': 'Een metalen frame in de vorm van een groot hoofd in een donkere scheepswerfhal, met materiaal op de vloer.',
  '0017jpg.jpg': 'Het grote gezicht met een kroon staat op de roodbruine romp van een boot op het water, voor een boogbrug met vlaggen.',
};

/** Groeten uit Lent ("Groeten uit lent"; HUISKAMERS stond in HEAD in de map huiskamers). */
const GROETEN_UIT_LENT: Record<string, string> = {
  'breuker lent 02-min.jpg': 'Een bouwplaats met een betonnen constructie met een trap waarop werklui in oranje kleding staan, naast rode bekisting, onder een grijze lucht.',
  'breuker lent 06-min.jpg': 'Een straat van bovenaf gezien: een fietser rijdt langs een afzetting met rood-wit lint, met wegwerkzaamheden en bouwmachines op de achtergrond.',
  'breuker lent 08-min.jpg': 'Drie mensen staan op een modderig pad dat in het water van een overstroomd landschap verdwijnt, onder een bewolkte lucht.',
  'HUISKAMERS 01-min.jpg': 'Een man staat achter de toonbank van een winkeltje vol spullen, met links een trap en rechts rekken met pakjes.',
  'HUISKAMERS 03-min.jpg': 'Doorkijkje door een bakstenen boog naar een woonkamer waar een man aan een tafel met een groen kleed zit, met ingelijste foto\'s aan de wand.',
  'HUISKAMERS 05-min.jpg': 'Een woonkamer met een grote boekenkast en een gedekte tafel: een man staat achter de tafel en twee mensen zitten op de vloer.',
};

/** Oostblok reportage: zwart-witfoto's. TODO(paul): plaatsen en jaartallen ontbreken (alleen wat te zien is beschreven). */
const OOSTBLOK_REPORTAGE: Record<string, string> = {
  // TODO(paul): locatie en jaartal controleren (poortgebouw achter een muur vol graffiti).
  '115.jpg': 'Zwart-witfoto van een poortgebouw met zuilen achter een muur vol graffiti, onder een lichte lucht.',
  '157.jpg': 'Zwart-witfoto van een binnenplaats waar een kind in dikke winterkleding met een speelgoedgeweer naar de camera loopt, met achter hem een ander kind en een auto.',
  '158.jpg': 'Zwart-witfoto van de zijkant van een stadsbus met passagiers achter de ramen.',
  '159.jpg': 'Zwart-witfoto van twee treinen met een man ertussen en een grote plas op de modderige grond.',
  '160.jpg': 'Zwart-witfoto van drie militairen in lange jassen voor een stenen gevel met Cyrillische letters.',
  '161.jpg': 'Zwart-witfoto van een groep gespierde mannen in sportkleding die poseren tegen een muur, met een jongen rechts.',
  '165.jpg': 'Zwart-witfoto van een natte, open plek met plassen, waarop mensen en een hond in de verte lopen voor een lange betonnen muur.',
  '202.jpg': 'Zwart-witportret van een oudere man met witte baard en een donkere jas die een witte pot vasthoudt, voor een muur met een getekend teken.',
  '203.jpg': 'Zwart-witfoto van een medewerkster in witte schort achter een toonbank waarboven rijen geplukte kippen hangen.',
  '206.jpg': 'Zwart-witfoto met weerspiegelingen in een winkelruit: een drukke straat met auto\'s en rechts een persoon aan een tafel.',
  '207.jpg': 'Zwart-witportret van een man met bontmuts en jas die opzij kijkt in een deuropening, met op de achtergrond andere mensen.',
};

/** Oude honden: honden en hun baasjes. */
const OUDE_HONDEN: Record<string, string> = {
  '026.jpg': 'Een grijsbruine hond loopt over een brede, lege straat, met een bestelauto in de verte.',
  '77.jpg': 'Een kleine zwart-bruine hond zit tussen twee barkrukken in een café, naast de benen van een bezoeker.',
  '78.jpg': 'Een bruin-witte hond met een blauw tuigje en uitgestoken tong staat op een stoep naast de benen van een voorbijganger.',
  '82.jpg': 'Een man met bril en donkere trui houdt twee kleine honden in zijn armen in een woonkamer met blauwe borden aan de muur.',
  '84.jpg': 'Een hond ligt op een metalen tafel in een witte ruimte met een aanrecht.',
  '86.jpg': 'Een bruin-witte hond met een wieltjesframe onder de achterpoten loopt buiten over een paadje, met een rood wiel zichtbaar.',
  '137h.jpg': 'Een kleine, donkere hond zit op een rieten stoel in een lichte kamer, met een ingelijst schilderij van een vrouw aan de muur.',
  '141.jpg': 'Een kinderkamer vol knuffels en speelgoed, met een witte wieg met baldakijn, een bed en een raam met gordijnen.',
  '205.jpg': 'Een kleine, lichtbruine hond zit tussen opgezette dieren, onder wie een leeuw, herten en een struisvogel.',
  'file02082.JPG': 'Een zwarte hond met wieltjes onder de achterpoten loopt, onscherp door de beweging, over een bladerrijk pad naast een persoon in rode schoenen.',
  'grootlinks.JPG': 'Een zwart-wit-bruine hond met een witte staart staat in het gras voor een houten schutting en kijkt in de camera.',
  'IMG_7240.JPG': 'Een man met lang wit haar en een hoed waarop een groene papegaai zit, naast een zwart-witte hond in een kamer met een ingelijst portret.',
  'rechts7.jpg': 'Een grijze, krullende hond met een lichtbruine snuit zit op een klinkerpad tussen planten en een wit beeld van een gans.',
};

/** Promoties (één foto, uit de oude lijst). */
const PROMOTIES: Record<string, string> = {
  'PROMOTIES 18.jpg': 'Twee vrouwen in een ruimte met een volgeschreven muur: de ene houdt een vel papier omhoog, de andere buigt zich ernaartoe.',
};

/**
 * Experimenteel: foto's van schilderijen en tekeningen, afbeeldingen van planten en bomen en een aantal asfaltfoto's.
 * TODO(paul): bij de schilderijen en tekeningen weet ik niet of ze van jou zijn; de beschrijving zegt alleen wat te zien is.
 */
const EXPERIMENTEEL: Record<string, string> = {
  '001.jpg': 'Schilderij in rode, bruine, gele en witte vlakken met zwarte contouren, vol onregelmatige, op elkaar aansluitende vormen.',
  '005 asfalt 2.jpg': 'Close-up van asfalt met links een roodbruin vlak met witte driehoeken en een zwarte teerstrook die omlaag loopt (dubbel van een foto in Asfalt).',
  '008.JPG': 'Bovenaanzicht van een smalle, roodbruine bak met houten randen waarin grote, blauwgrijze en zwarte bulten liggen.',
  '009.jpg': 'Schapen op modderige grond, een wit schaap met een blauwe verfstreep op de rug loopt naar links.',
  '010.jpg': 'Een dichte kudde schapen met dikke witte en lichtbruine vacht, tegen elkaar aan gedrukt.',
  '018.jpg': 'Kleurrijke schildering van een kraam of tafel met een gestreept dak, een gele bloem en een groene voet, omringd door blauwe, rode en oranje vlakken.',
  '021.ljpg.jpg': 'Grijs-zwarte tekening op een vel papier met fantasievormen: bovenaan stralende lijnen en onderaan een krullend gezicht.',
  '023.jpg': 'Close-up van asfalt met een zwarte teerlijn die in lussen omlaag loopt, met een wit labeltje onder een donkere vlek.',
  '029.jpg': 'Close-up van een oude, knoestige boomstam met holtes, waar zonlicht tussen de takken door valt.',
  '030.jpg': 'Een knoestige boomstam met een spleet in het midden, onder donker loof en boven gras.',
  '032.jpg': 'Gekleurde tekening op wit papier: een kronkelende vorm in blauw, roze, rood en zwart op een groen blad, met bovenaan een zwarte, gekrulde lijn.',
  '047.jpg': 'Abstracte zwart-witfoto van lichte, golvende vormen als gevouwen papier, met een donkere kronkelende lijn ertussen.',
  '047a.jpg': 'Bovenaanzicht van een smal laadruim met rijen grote, blauwgrijze en zwarte bulten tussen oranje en houten randen.',
  '052.jpg': 'Abstracte zwart-witfoto van onregelmatige witte vlakken en strepen tegen een donkere achtergrond.',
  '060.JPG': 'Portret van een oudere man met kaal hoofd, zwarte bril, wit overhemd en zwarte v-halstrui, in een groenige, schilderachtige tint.',
  '078.jpg': 'Schilderij in een zwarte lijst met felle kleuren: een rode vorm, blauwe en groene vlakken en een gele rand onderaan.',
  '086.jpg': 'Schilderachtig portret van een gezicht met bril en gestreept shirt in blauw, geel en bruin.',
  '087.jpg': 'Schilderachtig portret van een gezicht met open mond, warrig haar en felle ogen in blauw, geel en roodbruin.',
  '088.jpg': 'Schilderachtig portret van een gezicht met open mond in blauw, paars en geel, omringd door kleine vlakken.',
  'asfalt 1.jpg': 'Close-up van gebarsten asfalt met dikke zwarte teerlijnen die een vertakkend netwerk vormen.',
  'DSC04039.jpg': 'Close-up van gebarsten asfalt met links een smalle strook onkruid en zwarte teerlijnen die een rechthoekig patroon vormen.',
  'DSC04091.jpg': 'Close-up van gebarsten, korrelig asfalt met donkerblauwe lijnen die een kronkelend, vertakkend patroon vormen.',
  'eind.jpg': 'Bovenaanzicht van een palmvaren met een gele en oranje kroon in het midden en lange groene bladeren eromheen.',
  'L1126319.jpg': 'Interieur van een kerk met een rijk versierd houten altaar, met een wit heiligenbeeld tussen zuilen en daaronder een altaartafel.',
};

/**
 * Bruiloften portfolio: nieuwe map, alleen voor /portfolio (geen project, geen pagina).
 * Alleen beschreven wat te zien is; geen namen of plaatsen verzonnen.
 * TODO(paul): locaties en namen niet bekend; vul aan waar je dat wilt.
 */
const BRUILOFTEN_PORTFOLIO: Record<string, string> = {
  // 006.jpg is een kleine kopie (1024 px) van 7.jpg en staat niet op /portfolio/bruiloften (zie src/data/bruiloften.ts).
  '023t.jpg':
    'Een jongen in een donker pak en een meisje in een wit jurkje zitten in een geopende zwarte oldtimer op het gras; naast haar ligt een boeket.',
  '109.jpg':
    'Zwart-witfoto op een zandweg door het bos: een bruid met sluier en een bruidegom met corsage staan arm in arm bij een auto met open kofferbak, terwijl een man een band verwisselt.',
  '123.jpg':
    'Op een zandstrand aan de rivier omhelzen gasten elkaar naast een tafel met roze en blauwe linten en een man in een donkere toga. Op de achtergrond ligt een boot.',
  '155.jpg':
    'Portret van een bruid met rood krullend haar en een sluier, die twee kleine hondjes vasthoudt voor een treurwilg aan het water.',
  '167.jpg':
    'Een bruid in een strapless witte jurk en een bruidegom in een grijs pak met een blauwe corsage staan arm in arm voor een fotobehang met palmbomen en een strand.',
  '55.jpg':
    'Gasten in nette kleding staan tussen de graven op een begraafplaats; links omhelzen twee mannen elkaar en een vrouw in een oranje jurk met een boeket kijkt toe.',
  '7.jpg':
    'In een keuken wast een vrouw in een bloemetjesjurk een baby in de gootsteen. Achter haar filmt een man met een videocamera en staat een man in pak bij de open deur.',
  '0001.JPG': 'Vrouw in zwarte jurk met een rode bloem in haar hand, staand in een grasveld met uitzicht over een weids landschap.',
  '0003a.jpg': 'Zwart-witfoto van een bruidspaar onder een witte paraplu op een bospad.',
  '0006.jpg': 'Bruid en bruidegom op een grasveld voor een haag, met tussen hen in de grootmoeder in een rolstoel.',
  '0006a.JPG': 'Bruid en bruidegom bij een oranje muur, met een oudere vrouw in een oranje trui in een rolstoel op de voorgrond.',
  '0007.JPG': 'Een ouder echtpaar, hij in pak en zij met een rood vest, staand op een grasveld aan het water.',
  '0007a.JPG': 'Een oudere vrouw en een oudere man in een groene jas naast elkaar op het gras onder een boom.',
  '0009c.JPG': 'Bruid in een lange witte jurk en bruidegom in een donker pak op een grasveld voor groen struikgewas.',
  '0009d.JPG': 'Een man en een vrouw met een baby tussen hen in, gekleed voor een bruiloft, op een stoep.',
  '0009e.JPG': 'Bruid en bruidegom voor een fotoachtergrond met palmbomen en een blauwe lucht.',
  '0010.JPG': 'Twee vrouwen in rode shirts met kort haar kussen elkaar op de wang in een tuin.',
  '0012.JPG': 'Bruidspaar onder een boog van witte en rode ballonnen voor een bakstenen huis.',
  '0012a.JPG': 'Een oud echtpaar onder dezelfde ballonnenboog voor een bakstenen huis.',
  '0013.jpg': 'Een vrouw met roze hoed en jasje en een man in pak in een tuin met lage heggen.',
  '0014.jpg': 'Portret van een klein meisje in een wit jurkje met een knotje in haar haar, dat recht in de camera kijkt.',
  '0016.jpg': 'Portret van een vrouw met donker opgestoken haar en gesloten ogen, in een roze bloes.',
  '0016a.jpg': 'Portret van een vrouw met kort bruin haar en een zwarte bril, tegen een lichte achtergrond.',
  '0018.JPG': 'Een gast in een roze pak met bijpassende hoed, staand voor een begroeide rotswand.',
  '0020a.jpg': 'Een oudere vrouw in bloemetjesjurk met paarse hoed en een oudere man in een grijs pak op een grasveld tussen bomen.',
  '0024b.jpg': 'Bruid in witte bontstola met een boeket witte bloemen naast de bruidegom, tegen een donkere achtergrond.',
  '0024c.JPG': 'Bruid met een rood boeket naast de bruidegom in een wit pak, voor donker loof.',
  '0029.jpg': 'Een vrouw in een rode jurk en een man met baard in een geel-zwart pak met een baby op zijn arm, voor een groene haag.',
  '0031a.jpg': 'Bruidspaar met vier getuigen in pak en jurk op een plein onder een open overkapping.',
  '0032c.JPG': 'Een man in donker pak en een vrouw in een blauwe jurk staan naast elkaar in een park met trappen op de achtergrond.',
  '0047.jpg': 'Tijdens een ceremonie in een lichte zaal leest een man voor, terwijl een bruidegom en een bruid op witte stoelen staan.',
  '029d.jpg': 'Zwart-witfoto van een bruid in een wit kleed die over een dijkje van aarde wordt geholpen door een man in pak, aan het water.',
  '083.jpg': 'Zwart-witfoto van twee kleine bruidsmeisjes op de voorgrond; achter hen loopt een bruid in een park.',
  '107.jpg': 'Zwart-witfoto van een bruid en bruidegom bij een lage grafsteen met de tekst "Their name liveth for evermore" onder bomen.',
  '107A1262.jpg': 'Bruiloftsfeest met een vrouw in felrode jurk en sjaal en een vrouw met veelkleurige hoofddoek in warm licht.',
  '107A9256.jpg': 'Dansende gasten op een bruiloftsfeest, op de voorgrond een lachende vrouw in bloemetjesjurk.',
  '108.jpg': 'Zwart-witfoto in een auto: een bruidegom, een bruid met bloemenkrans en een vrouw naast haar.',
  '112.JPG': 'Een tent op een grasveld met een bruidspaar ervoor, in een wijds landschap onder een bewolkte lucht.',
  '119.jpg': 'Zwart-witfoto van een dansende menigte tijdens een bruiloft, met bewegingsonscherpte.',
  '120.jpg': 'Twee oudere vrouwen lopen over een plein langs een bruid en bruidegom, op de voorgrond hurkt een man.',
  '127.jpg': 'Een oude vrouw met wit haar en een jonge vrouw reiken door een autoraam naar elkaar toe.',
  '15.JPG': 'Detail in een badkamer: de benen van een kind op de rand van een bad, naast iemand in een wit hemd.',
  '153.JPG': 'Vrouw in zwarte jurk met een rode bloem in haar hand, staand in een heuvelachtig herfstlandschap.',
  '154.jpg': 'Bruid in een witte jurk met een boeket, lachend in een groene tuin.',
  '156.JPG': 'Portret van een bruid met blond opgestoken haar en een wit strapless jurkje.',
  '157.jpg': 'Zwart-witfoto van een bruid en bruidegom op een bospad, met een zwarte paraplu boven hen.',
  '158.jpg': 'Zwart-witfoto van een bruid en bruidegom onder een witte paraplu, hij houdt haar vast.',
  '162.jpg': 'Bruid en bruidegom met een klein meisje in lila jurkje voor een bakstenen huis, tussen witte bloemen.',
  '166.JPG': 'Bruid en bruidegom naast een oudere vrouw in rolstoel, voor een oranje muur.',
  '169.JPG': 'Een bruidspaar in lichtblauwe en witte kleding omhelst elkaar op het strand aan een rivier.',
  '17-06 (9A-10-10A)81.jpg': 'Zwart-witfoto van een grote groep mensen met paraplu\'s die op een rij staan voor een groot gebouw.',
  '170.jpg': 'Bruid in rode jurk en bruidegom in donker pak staan naast elkaar in een bos in de herfst.',
  '172.jpg': 'Twee mannen in witte pakken staan arm in arm op een grasveld aan het water.',
  '173.jpg': 'Twee vrouwen in rode jurken kussen elkaar en houden elkaar vast.',
  '174.jpg': 'Portret van een oudere vrouw met grijs haar en een crèmekleurige sjaal.',
  '179.jpg': 'Portret van een jong meisje in een wit jurkje met blond haar, dat opzij kijkt.',
  '18.jpg': 'Een woonkamer met een gezelschap op de achtergrond; op de bank liggen tassen, een hoed en kledingstukken.',
  '180.JPG': 'Portret van een oudere man met bril, stropdas en jasje voor een bakstenen muur met witte versieringen erboven.',
  '181.jpg': 'Bruid en bruidegom voor een barokaltaar in een kerk; zij draagt een gele jurk.',
  '183.jpg': 'Bruid en bruidegom in een zaal met rijk bewerkte witte en gouden wanden.',
  '184.jpg': 'Een oudere man met een viool in zijn hand, staand op het gras onder bomen.',
  '186.jpg': 'Twee vrouwen in rode jurken staan tegen elkaar aan en spreiden hun rode doeken uit tegen een blauwe schemerlucht.',
  '187.jpg': 'Portret van een lachende bruid met sluier en een boeket witte bloemen.',
  '189.jpg': 'Bruid en bruidegom in grijs pak staan dicht tegen elkaar in een lichte zaal met witte stoelen.',
  '19.jpg': 'Een bruid in witte jurk en een bruidegom in donker pak zitten op stoelen in een woonkamer met een kast.',
  '196.JPG': 'Een bruid in oranje jurk met een grote bruidegom in blauw pak en een vrouw in zwart, voor een donkerrode muur.',
  '20.jpg': 'Bruid met rood haar en sluier houdt twee kleine honden vast in een park aan het water.',
  '2a.jpg': 'Een bruidspaar in witte pakken voor een bakstenen muur met een groen reclamebord met de tekst "Reiters" in Nijmegen.',
  '39.jpg': 'Zwart-witfoto van een bruid en bruidegom in kleding uit een andere tijd, in een bos.',
  '40.jpg': 'Zwart-witfoto van een bruid in een kanten jurk en een bruidegom in een wit pak voor een gebouw.',
  '42.jpg': 'Bruidspaar met twee oudere gasten voor een voordeur met een versierde boog van ballonnen en vlaggetjes.',
  '6733p.jpg': 'Zwart-witfoto van een groep mensen in een smalle stadsstraat.',
  '79.jpg': 'Een lichte, lege zaal met rijen witte banken en een bruid op de achtergrond.',
  '80.JPG': 'Een bruidspaar loopt over een plein in een park onder een wolkige lucht, met een grote boom ernaast.',
  '81.JPG': 'Bruid en bruidegom staan voor een houten tuinhuisje met een afvalcontainer ernaast.',
  '95.jpg': 'Een bruid en bruidegom zitten in een kleine ruimte, terwijl een man achter een computerscherm bezig is.',
  'DSC02797.jpg': 'Kinderen en bruiloftsgasten in een park rond een bruid, op de achtergrond een kraam met rood-wit kleed.',
  'DSC03056.jpg': 'Gasten spelen een spel op een grasveld in een park, een vrouw in witte jurk valt voorover.',
  'DSC03653.jpg': 'Bruiloftsgasten in een auto: een meisje in witte jurk op de voorgrond, een man en een vrouw met mobiel achter haar.',
  'DSC04464.jpg': 'Groep bruidsmeisjes in turquoise jurken en één in rood bij het water, met een stadsskyline aan de overkant van het water.',
  'bruiloft1a.jpg': 'Een bruid in een grote witte jurk danst met gasten in een feestzaal.',
  'c18.jpg': 'Zwart-witfoto van een bruid en bruidegom die door een smalle straat met grachten en huizen lopen.',
};

const slugify = (value: string): string =>
  value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const metMap = (map: string, teksten: Record<string, string>): Record<string, string> =>
  Object.fromEntries(Object.entries(teksten).map(([bestand, alt]) => [`${map}/${bestand}`, alt]));

/** Pad ("<map>/<bestand>") naar alt-tekst. */
export const ALT_TEKSTEN: Record<string, string> = {
  ...metMap('portretten', PORTRETTEN),
  ...metMap('Asfalt', ASFALT),
  ...metMap('asty-mwaka', ASTY_MWAKA),
  ...metMap('het-gezicht-van-nijmegen', HET_GEZICHT_VAN_NIJMEGEN),
  ...metMap('Groeten uit lent', GROETEN_UIT_LENT),
  ...metMap('oostblok reportage', OOSTBLOK_REPORTAGE),
  ...metMap('oude honden', OUDE_HONDEN),
  ...metMap('promoties', PROMOTIES),
  ...metMap('experimenteel', EXPERIMENTEEL),
  ...metMap('bruiloften portfolio', BRUILOFTEN_PORTFOLIO),
};

/** Alt-teksten uit src/data/series.ts, per projectslug en bestandsnaam. */
const UIT_SERIES: Record<string, string> = Object.fromEntries(
  serieLijst.flatMap((serie) =>
    Object.entries(serie.altTeksten ?? {}).map(([bestand, alt]) => [`${serie.slug}/${bestand}`, alt] as const),
  ),
);

/** Alt-tekst van een foto: eerst dit bestand, dan de lijst van het project in series.ts; anders `undefined`. */
export function altVoor(map: string, bestand: string): string | undefined {
  return (ALT_TEKSTEN[`${map}/${bestand}`] ?? UIT_SERIES[`${slugify(map)}/${bestand}`])?.trim() || undefined;
}
