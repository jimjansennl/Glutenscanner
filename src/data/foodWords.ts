/**
 * Woorden die op een Nederlandse ingrediëntenlijst horen. Samengestelde woorden hoeven er niet
 * in: "zonnebloemolie" = zonnebloem + olie, "rijstebloem" = rijst + e + bloem.
 * Waarvoor: een foto mag pas groen zijn als de camera elk woord van de lijst herkent.
 * Een onbekend woord kan een leesfout zijn die net een glutenwoord verbergt.
 * Woorden toevoegen mag gewoon, met of zonder accenten (de app maakt ze gelijk).
 */
export const FOOD_ROOTS = `
aardappel aardbei aardnoot abrikoos acerola acesulfaam acht achtig additief agar agave ahorn alcohol algen alginaat
alkalisch allergenen amandel amarant amylase ananas anijs anijszaad annatto antiklontermiddel antioxidant appel
aroma aromatisch artisjok ascorbaat ascorbine asperge aspartaam aubergine avocado azijn
banaan basilicum basis bataat beschermend bes bessen bevat bevatten bewerkt bicarbonaat bier biet bieten bijenwas
bindmiddel biologisch bladerdeeg blauw blauwe bloem bloemkool boekweit boerenkool bonen bosbes bouillon boter braam
brandewijn broccoli brood bruin bruine bruis buffer butyl
cacao calcium caloriearm cappuccino caramel carbonaat carnauba carotenen carrageen cashew cassave cayenne cellulose champignon
cheddar cherry chia chilli chili chips chocolade chorizo cichorei citraat citroen citroenzuur citrus citrusvezel citrusvezels
clementine cocos cola concentraat conserveermiddel cranberry creatine crème curcuma curry
dadel dextrine dextrose diglyceriden dikmaker dille dinatrium dioxide disodium dragon droog droge druif druiven
edam ei eieren eigeel eiwit eiwitten emmentaler emulgator emulgatoren energie erwt erwten essence extract extracten
fenegriek fenyl fermentatie fijn fijne fosfaat fosfaten framboos frambozen fructose fruit fumaarzuur
gans garnaal garnalen gebakken gebrande gebrand gecondenseerd gedeeltelijk gedroogd gedroogde gefermenteerd gegeleerd geel gele
gehard geitenkaas gekarameliseerd gekonfijt gekookt gekookte gekruid gekruide gelatine gelei gemalen gemberwortel gember gemengd
gemodificeerd gemodificeerde gepasteuriseerd gepoft gerookt gerookte geroosterd geroosterde gerst geschild geschilde gesneden
gesmolten gestabiliseerd getrokken gezouten gezoet gierst gist glazuur glucono glucose glutamaat gluten glutenvrij glycerol
glycerine goud gom gouda graan granen granaatappel grapefruit groen groene groente groenten gruyère guar guarpitmeel
hagel hagelslag halfvolle haring havermout haver hazelnoot hazelnoten heel hele hennep honing hop houtrook hydroxide
ijzer ijzeroxide inuline invert invertsuiker
jalapeno jodium jodaat jus
kaas kalium kalk kalkoen kaneel kappertje karamel karnemelk kastanje kaliumsorbaat kers kersen kervel kikkererwt kikkererwten
kip kippen kipfilet kiwi knoflook kokos kokosnoot kokosolie kool koolhydraten koolzaad koolzuur koriander kruiden kruidnagel
kruidenextract kurkuma kwark kwartel
lactaat lactose lactosevrij lactosevrije laurier lecithine lecithinen levend licht lichte limoen linzen lijnzaad lupine
maïs mais maltitol maltodextrine mandarijn mango mangaan margarine marinade marjolein marsepein mascarpone meel melk melkchocolade
melkeiwit melkpoeder melkvet melkzuur meloen mineraal mineralen mint mono monoglyceriden mosterd mout mozzarella munt
muskaat muskaatnoot
naturel natrium natriumcarbonaat natuurlijk natuurlijke nitriet noot noten nootmuskaat
olie olien olijf olijfolie olijven omega oregano ossenstaart
paddenstoel palm palmolie palmvet paprika paranoot parmezaan passievrucht pastinaak patent pecan pecannoot pecannoten pectine
peper peperoni peren peer perzik peterselie piment pinda pinda's pindakaas pistache pistachenoot pistachenoten plantaardig plantaardige
poeder pompoen poedersuiker pompoenpit pompoenpitten porcini prei pruim pruimen
quinoa
raap raapzaad radijs rauwe regelaar reuzel riboflavine rietsuiker rijst rijsmiddel rijstmeel rijstebloem rode rood room
roomboter rozemarijn rozijn rozijnen rund runder rundvlees
saffraan salami salie sap sesam sesamzaad sinaasappel siroop sjalot sla smaak smaakstof smaakversterker soja sojabonen
sojalecithine sorbaat sorbitol specerij specerijen spek sperzie spinazie stabilisator stabilisatoren steviol stroop sucralose
suiker suikers sulfiet sulfieten
tapioca tarwe tartraat thijm tijm tomaat tomaten tonijn toevoeging tuinkers
ui uien uienpoeder
vanille vanilline varken varkensvlees vegetarisch verdikkingsmiddel verdikkingsmiddelen vers verse vet vetten vezel vezels
vis vlees vlierbes vloeibaar volkoren volle voedingszuur vrij vrije vrucht vruchten vruchtensap
walnoot walnoten water wei weipoeder wijn wijnazijn wit witte wortel wortelen
xanthaan xanthaangom
yoghurt
zaad zaden zeezout zetmeel zilvervlies zoet zoete zoetstof zoetstoffen zonnebloem zout zuivel zuur zuren zuurteregelaar
zuurteregelaars zuurdesem zwart zwarte
en of met van in uit op tot per bevat kan sporen geen voor als ook zonder het de een
waterstof ammonium kaliumcarbonaat magnesium zink koper selenium fosfor rook massa minimaal minimum maximaal kleurend voeding middel
middelen johannesbrood pit pitten stok stokje glans was spirulina zuren zuur appelzuur wijnsteen wijnsteenzuur azijnzuur
melkzuur ascorbinezuur sorbinezuur benzoëzuur benzoaat propionaat nisine natamycine sulfaat chloride carbonaten citraten
fosfaten acetaat gluconaat lactaten malaat tartraten silicium siliciumdioxide titaan talk paraffine schellak bijenwas
riboflavine thiamine niacine biotine foliumzuur cobalamine retinol tocoferol tocoferolen vitamine vitaminen calciferol
cholecalciferol pantotheenzuur pyridoxine carotene betacaroteen luteïne lycopeen anthocyanen chlorofyl chlorofylline
paprikaextract bietenrood karmijnzuur cochenille capsanthine curcumine annattonorbixine kurkuma spirulinaconcentraat
gist gistextract gisten zuurdesem enzym enzymen lipase protease lactase cultuur culturen melkzuurbacteriën bacteriën
pekel saus sausje dressing marinade puree concentraat pasta poeders vlokken korrels stukjes stukken plakjes blokjes reepjes
schijfjes snippers kruim kruimel kruimels gruis gries schilfers chips bolletjes balletjes vulling vullingen laagje laag
ham spekjes worst worstjes kip kalkoen eend lam lams geit schaap paard wild hert konijn zalm kabeljauw tonijn makreel
sardine ansjovis mosselen kreeft krab inktvis octopus surimi
melkchocolade pure puur wit cacaomassa cacaoboter cacaopoeder hazelnootpasta notenpasta pindapasta
vanillestokje vanillestokjes vanillearoma vanilleextract bourbon tahin tahini sesampasta
aardbeien frambozen bramen bosbessen kersen pruimen rozijnen krenten vijgen dadels abrikozen perziken peren appels
sinaasappels citroenen limoenen bananen ananas mango papaja passievrucht lychee granaatappel druiven kiwi meloenen
watermeloen rabarber vlierbloesem hibiscus rozenbottel bergamot munt pepermunt menthol eucalyptus zoethout drop salmiak
anijs venkel karwij komijn kardemom kurkumapoeder knoflookpoeder uienpoeder paprikapoeder chilipoeder kerrie
gember galgant citroengras kaffir koriander basilicum oregano rozemarijn tijm salie laurier dragon dille bieslook
peterselie kervel selderij selder knolselderij bleekselderij lavas mierikswortel wasabi
tomatenpuree passata ketchup mayonaise frietsaus mosterdzaad mosterdmeel
olijfolie zonnebloempitten pompoenpitten lijnzaad chiazaad hennepzaad maanzaad sesamzaad
glucosestroop fructosestroop invertsuikerstroop maltose isomalt erythritol xylitol mannitol stevia steviolglycosiden
sucralose acesulfaamk aspartaam cyclamaat sacharine thaumatine neohesperidine
pectine agaragar carrageen alginaat natriumalginaat johannesbroodpitmeel tarapitmeel cassiagom gellan gellangom
arabische gomarabicum cellulose methylcellulose carboxymethylcellulose
mono di tri glyceriden vetzuren vetzuur esters ester polysorbaat sorbitanmonostearaat stearaat lecithinen
zonnebloemlecithine sojalecithinen
gerookt rookaroma rooksmaak natuurlijk natuurlijke identiek smaakstoffen smaakmaker smaakmakers smaakversterkers
kleurstoffen kleurstof voedingsmiddelen kleurende verdikkingsmiddel glansmiddel glansmiddelen antiklontermiddelen
geleermiddel geleermiddelen bevochtigingsmiddel draagstof draagstoffen meelverbeteraar rijsmiddelen
verpakt beschermende atmosfeer minder dan meer gehalte totaal waarvan
stremsel zuursel difosfaten trifosfaten polyfosfaten cafeïne thee koffie lysozym pijnboompit pijnboompitten nori zeewier natriumnitraat kaliumnitraat grana padano parmigiano reggiano pecorino feta ricotta brie camembert emmentaler
`
  .split(/\s+/)
  .filter(Boolean)
