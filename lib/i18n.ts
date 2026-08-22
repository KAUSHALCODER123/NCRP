"use client";

import { useSyncExternalStore } from "react";

/**
 * Localisation.
 *
 * Seven languages covering roughly three-quarters of India by first language.
 * Scope is deliberate and stated rather than pretended: the shell, the
 * emergency path and the home page are fully translated, because those are
 * what a frightened person reads first. Long-form Learning Corner scripts stay
 * in English for now — a half-machine-translated scam script is worse than an
 * honest English one, since the whole point is recognising exact wording.
 *
 * Production path is Bhashini for all 22 official languages, including the
 * voice intake.
 */

export const LOCALES = [
  { id: "en", label: "English", native: "English" },
  { id: "hi", label: "Hindi", native: "हिन्दी" },
  { id: "mr", label: "Marathi", native: "मराठी" },
  { id: "gu", label: "Gujarati", native: "ગુજરાતી" },
  { id: "ta", label: "Tamil", native: "தமிழ்" },
  { id: "te", label: "Telugu", native: "తెలుగు" },
  { id: "kn", label: "Kannada", native: "ಕನ್ನಡ" },
] as const;

export type Locale = (typeof LOCALES)[number]["id"];

export type Key =
  | "nav.home" | "nav.report" | "nav.track" | "nav.check" | "nav.learn" | "nav.help"
  | "hdr.notGov" | "hdr.a11y" | "hdr.theme" | "hdr.language"
  | "hero.badge" | "hero.h1a" | "hero.h1b" | "hero.sub"
  | "hero.ctaReport" | "hero.ctaCall"
  | "hero.trust1" | "hero.trust2" | "hero.trust3"
  | "tiles.eyebrow" | "tiles.h2" | "tiles.sub"
  | "tiles.t1" | "tiles.t1body" | "tiles.t1meta"
  | "tiles.t2" | "tiles.t2body" | "tiles.t2meta"
  | "tiles.t3" | "tiles.t3body" | "tiles.t3meta"
  | "foot.helpTitle" | "foot.helpSub"
  | "foot.discStrong" | "foot.discBody"
  | "quick.exit";

type Dict = Record<Key, string>;

const en: Dict = {
  "nav.home": "Home",
  "nav.report": "Report a crime",
  "nav.track": "Track a case",
  "nav.check": "Check a suspect",
  "nav.learn": "Learning Corner",
  "nav.help": "Help",

  "hdr.notGov": "A proof of concept · not a Government of India service",
  "hdr.a11y": "Accessibility controls",
  "hdr.theme": "Theme",
  "hdr.language": "Language",

  "hero.badge": "National cyber crime reporting, reimagined",
  "hero.h1a": "Your money is still moving.",
  "hero.h1b": "So are we.",
  "hero.sub":
    "Stolen money is split across accounts within minutes. Every other portal spends those minutes on a form. This one asks the banks to hold your money first and collects the details afterwards.",
  "hero.ctaReport": "Report money lost",
  "hero.ctaCall": "Call",
  "hero.trust1": "No account needed to report",
  "hero.trust2": "Banks contacted in under a minute",
  "hero.trust3": "Nothing here files a real complaint",

  "tiles.eyebrow": "Report an incident",
  "tiles.h2": "What happened?",
  "tiles.sub":
    "Pick the closest one. You don't need to know what the crime is called, and you will never be asked which district it belongs to.",
  "tiles.t1": "Financial fraud",
  "tiles.t1body":
    "UPI, card, net banking or wallet. We contact the banks before we ask you anything else.",
  "tiles.t1meta": "About 60 seconds",
  "tiles.t2": "Women & children",
  "tiles.t2body":
    "Blackmail, intimate images, stalking, or abuse of a child. You can report without giving your name.",
  "tiles.t2meta": "Anonymous option",
  "tiles.t3": "Other cyber crime",
  "tiles.t3body":
    "Impersonation, a hacked account, or a fake profile using your name.",
  "tiles.t3meta": "Guided, no jargon",

  "foot.helpTitle": "Report a real cybercrime",
  "foot.helpSub":
    "Free, 24×7, in your language. The faster you call, the more can be held.",
  "foot.discStrong": "Sahaay is a student proof of concept, not a government service.",
  "foot.discBody":
    "It is not affiliated with, endorsed by, or connected to I4C, the Ministry of Home Affairs, or cybercrime.gov.in. No real complaint is filed here and no real data is processed.",

  "quick.exit": "Quick exit",
};

const hi: Dict = {
  "nav.home": "होम",
  "nav.report": "शिकायत दर्ज करें",
  "nav.track": "स्थिति देखें",
  "nav.check": "संदिग्ध जाँचें",
  "nav.learn": "जानकारी केंद्र",
  "nav.help": "सहायता",

  "hdr.notGov": "यह एक प्रोटोटाइप है · भारत सरकार की सेवा नहीं",
  "hdr.a11y": "सुगम्यता विकल्प",
  "hdr.theme": "थीम",
  "hdr.language": "भाषा",

  "hero.badge": "राष्ट्रीय साइबर अपराध रिपोर्टिंग, नए सिरे से",
  "hero.h1a": "आपका पैसा अब भी चल रहा है।",
  "hero.h1b": "हम भी।",
  "hero.sub":
    "चोरी हुआ पैसा मिनटों में कई खातों में बँट जाता है। बाकी पोर्टल वे मिनट फ़ॉर्म भरवाने में लगाते हैं। यह पहले बैंकों से आपका पैसा रोकने को कहता है, बाकी जानकारी बाद में लेता है।",
  "hero.ctaReport": "पैसे की शिकायत करें",
  "hero.ctaCall": "कॉल करें",
  "hero.trust1": "शिकायत के लिए खाता ज़रूरी नहीं",
  "hero.trust2": "एक मिनट के भीतर बैंकों से संपर्क",
  "hero.trust3": "यहाँ कोई असली शिकायत दर्ज नहीं होती",

  "tiles.eyebrow": "घटना की रिपोर्ट करें",
  "tiles.h2": "क्या हुआ?",
  "tiles.sub":
    "जो सबसे नज़दीक हो वही चुनें। आपको अपराध का नाम जानने की ज़रूरत नहीं, और ज़िला भी कभी नहीं पूछा जाएगा।",
  "tiles.t1": "वित्तीय धोखाधड़ी",
  "tiles.t1body":
    "UPI, कार्ड, नेट बैंकिंग या वॉलेट। कुछ भी पूछने से पहले हम बैंकों से संपर्क करते हैं।",
  "tiles.t1meta": "लगभग 60 सेकंड",
  "tiles.t2": "महिलाएँ और बच्चे",
  "tiles.t2body":
    "ब्लैकमेल, निजी तस्वीरें, पीछा करना, या बच्चे के साथ दुर्व्यवहार। आप बिना नाम बताए भी शिकायत कर सकते हैं।",
  "tiles.t2meta": "गुमनाम विकल्प",
  "tiles.t3": "अन्य साइबर अपराध",
  "tiles.t3body":
    "पहचान की नकल, हैक किया गया खाता, या आपके नाम से बनी फ़र्ज़ी प्रोफ़ाइल।",
  "tiles.t3meta": "आसान भाषा में",

  "foot.helpTitle": "असली साइबर अपराध की शिकायत करें",
  "foot.helpSub":
    "मुफ़्त, 24×7, आपकी भाषा में। जितनी जल्दी कॉल करेंगे, उतना ज़्यादा पैसा रोका जा सकेगा।",
  "foot.discStrong": "सहाय एक छात्र प्रोटोटाइप है, सरकारी सेवा नहीं।",
  "foot.discBody":
    "इसका I4C, गृह मंत्रालय या cybercrime.gov.in से कोई संबंध नहीं है। यहाँ कोई असली शिकायत दर्ज नहीं होती और कोई वास्तविक डेटा संसाधित नहीं होता।",

  "quick.exit": "तुरंत बाहर",
};

const mr: Dict = {
  "nav.home": "मुख्यपृष्ठ",
  "nav.report": "तक्रार नोंदवा",
  "nav.track": "स्थिती पहा",
  "nav.check": "संशयित तपासा",
  "nav.learn": "माहिती केंद्र",
  "nav.help": "मदत",

  "hdr.notGov": "हा एक नमुना प्रकल्प आहे · भारत सरकारची सेवा नाही",
  "hdr.a11y": "सुलभता पर्याय",
  "hdr.theme": "थीम",
  "hdr.language": "भाषा",

  "hero.badge": "राष्ट्रीय सायबर गुन्हे नोंदणी, नव्याने",
  "hero.h1a": "तुमचे पैसे अजूनही फिरत आहेत.",
  "hero.h1b": "आम्हीही.",
  "hero.sub":
    "चोरीचे पैसे काही मिनिटांत अनेक खात्यांत विभागले जातात. इतर पोर्टल ते मिनिटे फॉर्म भरण्यात घालवतात. हे आधी बँकांना पैसे थांबवायला सांगते, तपशील नंतर घेते.",
  "hero.ctaReport": "पैशांची तक्रार नोंदवा",
  "hero.ctaCall": "कॉल करा",
  "hero.trust1": "तक्रारीसाठी खाते आवश्यक नाही",
  "hero.trust2": "एका मिनिटात बँकांशी संपर्क",
  "hero.trust3": "इथे खरी तक्रार नोंदवली जात नाही",

  "tiles.eyebrow": "घटना नोंदवा",
  "tiles.h2": "काय घडले?",
  "tiles.sub":
    "सर्वात जवळचे निवडा. गुन्ह्याचे नाव माहीत असण्याची गरज नाही, आणि जिल्हा कधीही विचारला जाणार नाही.",
  "tiles.t1": "आर्थिक फसवणूक",
  "tiles.t1body":
    "UPI, कार्ड, नेट बँकिंग किंवा वॉलेट. काहीही विचारण्यापूर्वी आम्ही बँकांशी संपर्क साधतो.",
  "tiles.t1meta": "सुमारे 60 सेकंद",
  "tiles.t2": "महिला व मुले",
  "tiles.t2body":
    "ब्लॅकमेल, खासगी छायाचित्रे, पाठलाग, किंवा मुलावर अत्याचार. नाव न सांगताही तक्रार करता येते.",
  "tiles.t2meta": "निनावी पर्याय",
  "tiles.t3": "इतर सायबर गुन्हे",
  "tiles.t3body":
    "तोतयागिरी, हॅक झालेले खाते, किंवा तुमच्या नावाने बनवलेले बनावट प्रोफाइल.",
  "tiles.t3meta": "सोप्या भाषेत",

  "foot.helpTitle": "खऱ्या सायबर गुन्ह्याची तक्रार करा",
  "foot.helpSub":
    "मोफत, 24×7, तुमच्या भाषेत. जितक्या लवकर कॉल कराल, तितके जास्त पैसे थांबवता येतील.",
  "foot.discStrong": "सहाय हा विद्यार्थ्यांचा नमुना प्रकल्प आहे, सरकारी सेवा नाही.",
  "foot.discBody":
    "याचा I4C, गृह मंत्रालय किंवा cybercrime.gov.in शी संबंध नाही. इथे खरी तक्रार नोंदवली जात नाही आणि खरा डेटा वापरला जात नाही.",

  "quick.exit": "त्वरित बाहेर",
};

const gu: Dict = {
  "nav.home": "હોમ",
  "nav.report": "ફરિયાદ નોંધાવો",
  "nav.track": "સ્થિતિ જુઓ",
  "nav.check": "શંકાસ્પદ તપાસો",
  "nav.learn": "માહિતી કેન્દ્ર",
  "nav.help": "મદદ",

  "hdr.notGov": "આ એક નમૂનો પ્રોજેક્ટ છે · ભારત સરકારની સેવા નથી",
  "hdr.a11y": "સુલભતા વિકલ્પો",
  "hdr.theme": "થીમ",
  "hdr.language": "ભાષા",

  "hero.badge": "રાષ્ટ્રીય સાયબર ક્રાઇમ રિપોર્ટિંગ, નવેસરથી",
  "hero.h1a": "તમારા પૈસા હજી ફરી રહ્યા છે.",
  "hero.h1b": "અમે પણ.",
  "hero.sub":
    "ચોરાયેલા પૈસા મિનિટોમાં અનેક ખાતાંમાં વહેંચાઈ જાય છે. બીજા પોર્ટલ એ મિનિટો ફોર્મ ભરાવવામાં વિતાવે છે. આ પહેલાં બેંકોને પૈસા રોકવા કહે છે, વિગતો પછી લે છે.",
  "hero.ctaReport": "પૈસાની ફરિયાદ કરો",
  "hero.ctaCall": "કૉલ કરો",
  "hero.trust1": "ફરિયાદ માટે ખાતું જરૂરી નથી",
  "hero.trust2": "એક મિનિટમાં બેંકોનો સંપર્ક",
  "hero.trust3": "અહીં ખરી ફરિયાદ નોંધાતી નથી",

  "tiles.eyebrow": "ઘટના નોંધાવો",
  "tiles.h2": "શું થયું?",
  "tiles.sub":
    "સૌથી નજીકનું પસંદ કરો. ગુનાનું નામ જાણવાની જરૂર નથી, અને જિલ્લો ક્યારેય પૂછાશે નહીં.",
  "tiles.t1": "નાણાકીય છેતરપિંડી",
  "tiles.t1body":
    "UPI, કાર્ડ, નેટ બેંકિંગ કે વૉલેટ. કંઈ પણ પૂછતાં પહેલાં અમે બેંકોનો સંપર્ક કરીએ છીએ.",
  "tiles.t1meta": "લગભગ 60 સેકન્ડ",
  "tiles.t2": "મહિલાઓ અને બાળકો",
  "tiles.t2body":
    "બ્લેકમેલ, ખાનગી તસવીરો, પીછો, કે બાળક સાથે દુર્વ્યવહાર. નામ આપ્યા વિના પણ ફરિયાદ થઈ શકે.",
  "tiles.t2meta": "અનામી વિકલ્પ",
  "tiles.t3": "અન્ય સાયબર ગુના",
  "tiles.t3body":
    "ઓળખની નકલ, હેક થયેલું ખાતું, કે તમારા નામે બનેલી નકલી પ્રોફાઇલ.",
  "tiles.t3meta": "સરળ ભાષામાં",

  "foot.helpTitle": "ખરા સાયબર ગુનાની ફરિયાદ કરો",
  "foot.helpSub":
    "મફત, 24×7, તમારી ભાષામાં. જેટલો વહેલો કૉલ, તેટલા વધુ પૈસા રોકી શકાય.",
  "foot.discStrong": "સહાય એ વિદ્યાર્થીનો નમૂનો પ્રોજેક્ટ છે, સરકારી સેવા નથી.",
  "foot.discBody":
    "તેનો I4C, ગૃહ મંત્રાલય કે cybercrime.gov.in સાથે સંબંધ નથી. અહીં ખરી ફરિયાદ નોંધાતી નથી અને ખરો ડેટા વપરાતો નથી.",

  "quick.exit": "તરત બહાર",
};

const ta: Dict = {
  "nav.home": "முகப்பு",
  "nav.report": "புகார் அளிக்க",
  "nav.track": "நிலையைப் பார்க்க",
  "nav.check": "சந்தேகத்தைச் சரிபார்க்க",
  "nav.learn": "தகவல் மையம்",
  "nav.help": "உதவி",

  "hdr.notGov": "இது ஒரு மாதிரித் திட்டம் · இந்திய அரசின் சேவை அல்ல",
  "hdr.a11y": "அணுகல் விருப்பங்கள்",
  "hdr.theme": "தீம்",
  "hdr.language": "மொழி",

  "hero.badge": "தேசிய இணையக் குற்றப் புகார், புதிதாக",
  "hero.h1a": "உங்கள் பணம் இன்னும் நகர்கிறது.",
  "hero.h1b": "நாங்களும்தான்.",
  "hero.sub":
    "திருடப்பட்ட பணம் நிமிடங்களில் பல கணக்குகளுக்குப் பிரிக்கப்படுகிறது. மற்ற தளங்கள் அந்த நிமிடங்களைப் படிவம் நிரப்புவதில் செலவிடுகின்றன. இது முதலில் வங்கிகளிடம் பணத்தை நிறுத்தச் சொல்கிறது, விவரங்களைப் பிறகு கேட்கிறது.",
  "hero.ctaReport": "பணப் புகார் அளிக்க",
  "hero.ctaCall": "அழைக்க",
  "hero.trust1": "புகாருக்குக் கணக்கு தேவையில்லை",
  "hero.trust2": "ஒரு நிமிடத்திற்குள் வங்கிகளுடன் தொடர்பு",
  "hero.trust3": "இங்கு உண்மையான புகார் பதிவாகாது",

  "tiles.eyebrow": "சம்பவத்தைப் பதிவு செய்க",
  "tiles.h2": "என்ன நடந்தது?",
  "tiles.sub":
    "மிக நெருக்கமானதைத் தேர்ந்தெடுங்கள். குற்றத்தின் பெயர் தெரிய வேண்டியதில்லை, மாவட்டமும் ஒருபோதும் கேட்கப்படாது.",
  "tiles.t1": "நிதி மோசடி",
  "tiles.t1body":
    "UPI, அட்டை, நெட் பேங்கிங் அல்லது வாலட். எதையும் கேட்கும் முன் நாங்கள் வங்கிகளைத் தொடர்பு கொள்கிறோம்.",
  "tiles.t1meta": "சுமார் 60 வினாடிகள்",
  "tiles.t2": "பெண்கள் மற்றும் குழந்தைகள்",
  "tiles.t2body":
    "மிரட்டல், தனிப்பட்ட படங்கள், துரத்தல், அல்லது குழந்தை துன்புறுத்தல். பெயர் சொல்லாமலும் புகார் அளிக்கலாம்.",
  "tiles.t2meta": "அநாமதேய வழி",
  "tiles.t3": "பிற இணையக் குற்றங்கள்",
  "tiles.t3body":
    "ஆள்மாறாட்டம், முடக்கப்பட்ட கணக்கு, அல்லது உங்கள் பெயரில் போலி சுயவிவரம்.",
  "tiles.t3meta": "எளிய மொழியில்",

  "foot.helpTitle": "உண்மையான இணையக் குற்றத்தைப் புகாரளிக்க",
  "foot.helpSub":
    "இலவசம், 24×7, உங்கள் மொழியில். எவ்வளவு விரைவில் அழைக்கிறீர்களோ, அவ்வளவு பணம் தடுக்கப்படும்.",
  "foot.discStrong": "சகாய் ஒரு மாணவர் மாதிரித் திட்டம், அரசு சேவை அல்ல.",
  "foot.discBody":
    "இதற்கு I4C, உள்துறை அமைச்சகம் அல்லது cybercrime.gov.in உடன் தொடர்பு இல்லை. இங்கு உண்மையான புகார் பதிவாகாது, உண்மையான தரவும் பயன்படுத்தப்படாது.",

  "quick.exit": "உடனே வெளியேறு",
};

const te: Dict = {
  "nav.home": "హోమ్",
  "nav.report": "ఫిర్యాదు చేయండి",
  "nav.track": "స్థితి చూడండి",
  "nav.check": "అనుమానితుడిని తనిఖీ చేయండి",
  "nav.learn": "సమాచార కేంద్రం",
  "nav.help": "సహాయం",

  "hdr.notGov": "ఇది ఒక నమూనా ప్రాజెక్ట్ · భారత ప్రభుత్వ సేవ కాదు",
  "hdr.a11y": "అందుబాటు ఎంపికలు",
  "hdr.theme": "థీమ్",
  "hdr.language": "భాష",

  "hero.badge": "జాతీయ సైబర్ నేర ఫిర్యాదు, కొత్తగా",
  "hero.h1a": "మీ డబ్బు ఇంకా కదులుతోంది.",
  "hero.h1b": "మేమూ అంతే.",
  "hero.sub":
    "దొంగిలించిన డబ్బు నిమిషాల్లో అనేక ఖాతాల్లోకి చీలిపోతుంది. మిగతా పోర్టళ్లు ఆ నిమిషాలను ఫారం నింపడంలో గడుపుతాయి. ఇది ముందు బ్యాంకులను డబ్బు ఆపమని అడుగుతుంది, వివరాలు తర్వాత తీసుకుంటుంది.",
  "hero.ctaReport": "డబ్బు గురించి ఫిర్యాదు",
  "hero.ctaCall": "కాల్ చేయండి",
  "hero.trust1": "ఫిర్యాదుకు ఖాతా అవసరం లేదు",
  "hero.trust2": "ఒక నిమిషంలో బ్యాంకులతో సంప్రదింపు",
  "hero.trust3": "ఇక్కడ నిజమైన ఫిర్యాదు నమోదు కాదు",

  "tiles.eyebrow": "సంఘటనను నమోదు చేయండి",
  "tiles.h2": "ఏమి జరిగింది?",
  "tiles.sub":
    "దగ్గరగా ఉన్నదాన్ని ఎంచుకోండి. నేరం పేరు తెలియాల్సిన అవసరం లేదు, జిల్లా కూడా ఎప్పుడూ అడగబడదు.",
  "tiles.t1": "ఆర్థిక మోసం",
  "tiles.t1body":
    "UPI, కార్డ్, నెట్ బ్యాంకింగ్ లేదా వాలెట్. ఏదైనా అడగడానికి ముందు మేము బ్యాంకులను సంప్రదిస్తాం.",
  "tiles.t1meta": "సుమారు 60 సెకన్లు",
  "tiles.t2": "మహిళలు & పిల్లలు",
  "tiles.t2body":
    "బ్లాక్‌మెయిల్, వ్యక్తిగత చిత్రాలు, వెంబడించడం, లేదా పిల్లలపై దుర్వినియోగం. పేరు చెప్పకుండా కూడా ఫిర్యాదు చేయవచ్చు.",
  "tiles.t2meta": "అనామక ఎంపిక",
  "tiles.t3": "ఇతర సైబర్ నేరాలు",
  "tiles.t3body":
    "వేషధారణ, హ్యాక్ అయిన ఖాతా, లేదా మీ పేరుతో నకిలీ ప్రొఫైల్.",
  "tiles.t3meta": "సులభ భాషలో",

  "foot.helpTitle": "నిజమైన సైబర్ నేరాన్ని ఫిర్యాదు చేయండి",
  "foot.helpSub":
    "ఉచితం, 24×7, మీ భాషలో. ఎంత త్వరగా కాల్ చేస్తే అంత ఎక్కువ డబ్బు ఆపగలం.",
  "foot.discStrong": "సహాయ్ ఒక విద్యార్థి నమూనా ప్రాజెక్ట్, ప్రభుత్వ సేవ కాదు.",
  "foot.discBody":
    "దీనికి I4C, హోం మంత్రిత్వ శాఖ లేదా cybercrime.gov.in తో సంబంధం లేదు. ఇక్కడ నిజమైన ఫిర్యాదు నమోదు కాదు, నిజమైన డేటా ఉపయోగించబడదు.",

  "quick.exit": "వెంటనే నిష్క్రమించు",
};

const kn: Dict = {
  "nav.home": "ಮುಖಪುಟ",
  "nav.report": "ದೂರು ದಾಖಲಿಸಿ",
  "nav.track": "ಸ್ಥಿತಿ ನೋಡಿ",
  "nav.check": "ಶಂಕಿತರನ್ನು ಪರಿಶೀಲಿಸಿ",
  "nav.learn": "ಮಾಹಿತಿ ಕೇಂದ್ರ",
  "nav.help": "ಸಹಾಯ",

  "hdr.notGov": "ಇದು ಒಂದು ಮಾದರಿ ಯೋಜನೆ · ಭಾರತ ಸರ್ಕಾರದ ಸೇವೆ ಅಲ್ಲ",
  "hdr.a11y": "ಪ್ರವೇಶ ಆಯ್ಕೆಗಳು",
  "hdr.theme": "ಥೀಮ್",
  "hdr.language": "ಭಾಷೆ",

  "hero.badge": "ರಾಷ್ಟ್ರೀಯ ಸೈಬರ್ ಅಪರಾಧ ವರದಿ, ಹೊಸದಾಗಿ",
  "hero.h1a": "ನಿಮ್ಮ ಹಣ ಈಗಲೂ ಚಲಿಸುತ್ತಿದೆ.",
  "hero.h1b": "ನಾವೂ ಸಹ.",
  "hero.sub":
    "ಕದ್ದ ಹಣ ನಿಮಿಷಗಳಲ್ಲಿ ಹಲವು ಖಾತೆಗಳಿಗೆ ಹಂಚಿಹೋಗುತ್ತದೆ. ಬೇರೆ ಪೋರ್ಟಲ್‌ಗಳು ಆ ನಿಮಿಷಗಳನ್ನು ಅರ್ಜಿ ತುಂಬಿಸುವುದರಲ್ಲಿ ಕಳೆಯುತ್ತವೆ. ಇದು ಮೊದಲು ಬ್ಯಾಂಕುಗಳಿಗೆ ಹಣ ತಡೆಯಲು ಹೇಳುತ್ತದೆ, ವಿವರಗಳನ್ನು ನಂತರ ಪಡೆಯುತ್ತದೆ.",
  "hero.ctaReport": "ಹಣದ ಬಗ್ಗೆ ದೂರು",
  "hero.ctaCall": "ಕರೆ ಮಾಡಿ",
  "hero.trust1": "ದೂರಿಗೆ ಖಾತೆ ಅಗತ್ಯವಿಲ್ಲ",
  "hero.trust2": "ಒಂದು ನಿಮಿಷದಲ್ಲಿ ಬ್ಯಾಂಕುಗಳ ಸಂಪರ್ಕ",
  "hero.trust3": "ಇಲ್ಲಿ ನಿಜವಾದ ದೂರು ದಾಖಲಾಗುವುದಿಲ್ಲ",

  "tiles.eyebrow": "ಘಟನೆಯನ್ನು ದಾಖಲಿಸಿ",
  "tiles.h2": "ಏನಾಯಿತು?",
  "tiles.sub":
    "ಹತ್ತಿರದ್ದನ್ನು ಆರಿಸಿ. ಅಪರಾಧದ ಹೆಸರು ಗೊತ್ತಿರಬೇಕಾಗಿಲ್ಲ, ಮತ್ತು ಜಿಲ್ಲೆಯನ್ನೂ ಎಂದಿಗೂ ಕೇಳುವುದಿಲ್ಲ.",
  "tiles.t1": "ಹಣಕಾಸು ವಂಚನೆ",
  "tiles.t1body":
    "UPI, ಕಾರ್ಡ್, ನೆಟ್ ಬ್ಯಾಂಕಿಂಗ್ ಅಥವಾ ವಾಲೆಟ್. ಏನನ್ನೂ ಕೇಳುವ ಮೊದಲು ನಾವು ಬ್ಯಾಂಕುಗಳನ್ನು ಸಂಪರ್ಕಿಸುತ್ತೇವೆ.",
  "tiles.t1meta": "ಸುಮಾರು 60 ಸೆಕೆಂಡು",
  "tiles.t2": "ಮಹಿಳೆಯರು ಮತ್ತು ಮಕ್ಕಳು",
  "tiles.t2body":
    "ಬ್ಲ್ಯಾಕ್‌ಮೇಲ್, ಖಾಸಗಿ ಚಿತ್ರಗಳು, ಹಿಂಬಾಲಿಸುವಿಕೆ, ಅಥವಾ ಮಗುವಿನ ಮೇಲಿನ ದೌರ್ಜನ್ಯ. ಹೆಸರು ಹೇಳದೆಯೂ ದೂರು ನೀಡಬಹುದು.",
  "tiles.t2meta": "ಅನಾಮಧೇಯ ಆಯ್ಕೆ",
  "tiles.t3": "ಇತರ ಸೈಬರ್ ಅಪರಾಧ",
  "tiles.t3body":
    "ಸೋಗು ಹಾಕುವಿಕೆ, ಹ್ಯಾಕ್ ಆದ ಖಾತೆ, ಅಥವಾ ನಿಮ್ಮ ಹೆಸರಿನ ನಕಲಿ ಪ್ರೊಫೈಲ್.",
  "tiles.t3meta": "ಸರಳ ಭಾಷೆಯಲ್ಲಿ",

  "foot.helpTitle": "ನಿಜವಾದ ಸೈಬರ್ ಅಪರಾಧವನ್ನು ವರದಿ ಮಾಡಿ",
  "foot.helpSub":
    "ಉಚಿತ, 24×7, ನಿಮ್ಮ ಭಾಷೆಯಲ್ಲಿ. ಎಷ್ಟು ಬೇಗ ಕರೆ ಮಾಡುತ್ತೀರೋ ಅಷ್ಟು ಹೆಚ್ಚು ಹಣ ತಡೆಯಬಹುದು.",
  "foot.discStrong": "ಸಹಾಯ್ ಒಂದು ವಿದ್ಯಾರ್ಥಿ ಮಾದರಿ ಯೋಜನೆ, ಸರ್ಕಾರಿ ಸೇವೆ ಅಲ್ಲ.",
  "foot.discBody":
    "ಇದಕ್ಕೆ I4C, ಗೃಹ ಸಚಿವಾಲಯ ಅಥವಾ cybercrime.gov.in ಜೊತೆ ಸಂಬಂಧವಿಲ್ಲ. ಇಲ್ಲಿ ನಿಜವಾದ ದೂರು ದಾಖಲಾಗುವುದಿಲ್ಲ ಮತ್ತು ನಿಜವಾದ ಡೇಟಾ ಬಳಸುವುದಿಲ್ಲ.",

  "quick.exit": "ತಕ್ಷಣ ನಿರ್ಗಮಿಸಿ",
};

const DICTS: Record<Locale, Dict> = { en, hi, mr, gu, ta, te, kn };

/* ---------------- store ---------------- */

let cache: Locale = "en";
const listeners = new Set<() => void>();

function snapshot(): Locale {
  const l = (document.documentElement.lang || "en") as Locale;
  const next = l in DICTS ? l : "en";
  if (next !== cache) cache = next;
  return cache;
}

export function setLocale(locale: Locale) {
  document.documentElement.lang = locale;
  try {
    localStorage.setItem("sahaay-lang", locale);
  } catch {
    /* preference just won't persist */
  }
  for (const l of listeners) l();
}

export function useLocale(): Locale {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    snapshot,
    () => "en",
  );
}

/** Falls back to English per key, so a missing string is never a blank. */
export function useT(): (k: Key) => string {
  const locale = useLocale();
  return (k) => DICTS[locale]?.[k] ?? en[k];
}
