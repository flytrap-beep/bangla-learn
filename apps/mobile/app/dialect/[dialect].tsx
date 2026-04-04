import React, { useRef, useEffect } from "react";
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView, Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import type { Dialect } from "@bangla-learn/types";
import { T } from "@/lib/theme";
import { trackScreenView } from "@/lib/analytics";

type IoniconsName = React.ComponentProps<typeof Ionicons>["name"];

type DialectData = {
  nameBn: string;
  nameEn: string;
  color: string;
  region: string;
  regionBn: string;
  speakers: string;
  about: string;
  differences: { title: string; desc: string; example?: string }[];
  phrases: { bangla: string; roman: string; english: string }[];
  pronunciationTips: string[];
};

const DIALECT_DATA: Record<string, DialectData> = {
  standard: {
    nameBn: "মান বাংলা",
    nameEn: "Standard Bengali",
    color: T.green,
    region: "Dhaka & nationwide",
    regionBn: "ঢাকা ও সারাদেশ",
    speakers: "170+ million",
    about: "Standard Bengali (মান ভাষা) is the official language of Bangladesh. It was standardised in the 19th century and is used in education, media, and government. It is based on the dialect of the Nadia region.",
    differences: [
      { title: "Subject-Object-Verb order", desc: "Bengali puts the verb at the END of the sentence.", example: "আমি ভাত খাই → Ami bhat khai → I rice eat (I eat rice)" },
      { title: "Formal vs Informal 'you'", desc: "আপনি (apni) is formal; তুমি (tumi) is informal; তুই (tui) is very casual.", example: "আপনি কেমন আছেন? vs তুমি কেমন আছ?" },
      { title: "The connecting Matra line", desc: "Letters in a word are connected by a horizontal line called মাত্রা (matra) at the top.", example: "বাংলা — notice the top bar connecting letters" },
      { title: "No articles (a/the)", desc: "Bengali does not use articles. Context determines definiteness.", example: "বই = a book OR the book" },
      { title: "Verb conjugation by formality", desc: "Verbs change based on who you're speaking to (formal/informal).", example: "খান (khan) = eats (formal) vs খায় (khay) = eats (informal)" },
    ],
    phrases: [
      { bangla: "নমস্কার / আস-সালামু আলাইকুম", roman: "Nomoshkar / Assalamu alaikum", english: "Hello (Hindu/Muslim greeting)" },
      { bangla: "কেমন আছেন?", roman: "Kemon achen?", english: "How are you? (formal)" },
      { bangla: "আমি ভালো আছি", roman: "Ami bhalo achi", english: "I am fine" },
      { bangla: "ধন্যবাদ", roman: "Dhonnobad", english: "Thank you" },
      { bangla: "আল্লাহ হাফেজ / বিদায়", roman: "Allah hafez / Biday", english: "Goodbye" },
      { bangla: "আমার নাম ...", roman: "Amar naam ...", english: "My name is ..." },
      { bangla: "বুঝতে পারছি না", roman: "Bujhte parchhi na", english: "I don't understand" },
      { bangla: "আরেকটু আস্তে বলুন", roman: "Arektu aste bolun", english: "Please speak more slowly" },
    ],
    pronunciationTips: [
      "অ at start of words sounds like 'o' (as in 'go'), but in the middle it sounds like 'a'",
      "ব and ভ sound more like English 'b' and 'bh' (breathy b)",
      "ড় and ঢ় are retroflex sounds — tongue curls to roof of mouth",
      "The letter এ sounds like 'a' in 'care', not like English 'e'",
    ],
  },
  sylheti: {
    nameBn: "সিলেটি",
    nameEn: "Sylheti",
    color: "#7c3aed",
    region: "Sylhet Division + UK diaspora",
    regionBn: "সিলেট বিভাগ",
    speakers: "~11 million",
    about: "Sylheti (সিলেটি) is spoken in the Sylhet Division of northeast Bangladesh and widely used by the British-Bangladeshi community in the UK. It has its own ancient script called Sylheti Nagri (সিলেটি নাগরী). Sylheti differs significantly from Standard Bengali in vocabulary and pronunciation.",
    differences: [
      { title: "হে = He/She", desc: "Sylheti uses হে (he) instead of Standard Bengali সে (she/he) for third person.", example: "হে যায় = He/She goes" },
      { title: "আফা = Sister", desc: "The word for older sister is আফা (apha) instead of আপু or বোন.", example: "আমার আফা = my sister" },
      { title: "আব্বা = Father", desc: "Father is called আব্বা (abba) — influenced by Arabic via Islamic culture.", example: "আমার আব্বা = my father" },
      { title: "হই = Yes", desc: "Yes is হই (hoi) instead of Standard হ্যাঁ (hæ).", example: "হই, বুঝিছি = Yes, I understand" },
      { title: "কিতা = What", desc: "What is কিতা (kita) instead of Standard কী (ki).", example: "কিতা খাইলা? = What did you eat?" },
      { title: "ভালা = Good/Well", desc: "Good is ভালা (bhala) instead of ভালো (bhalo).", example: "আমি ভালা আসি = I am well" },
    ],
    phrases: [
      { bangla: "ভালা আসেন?", roman: "Bhala assen?", english: "Are you well? (greeting)" },
      { bangla: "আমি ভালা আসি", roman: "Ami bhala ashi", english: "I am fine" },
      { bangla: "কিতা খাইলা?", roman: "Kita khaila?", english: "What did you eat?" },
      { bangla: "গেলাম", roman: "Gelam", english: "I'm off / Goodbye (casual)" },
      { bangla: "হই, বুঝিছি", roman: "Hoi, bujhichi", english: "Yes, I understand" },
      { bangla: "আফা, কই গেলা?", roman: "Apha, koi gela?", english: "Sister, where did you go?" },
      { bangla: "আমার নাম ...", roman: "Amar naam ...", english: "My name is ..." },
      { bangla: "তুমার নাম কিতা?", roman: "Tumar naam kita?", english: "What is your name?" },
    ],
    pronunciationTips: [
      "Sylheti vowels are slightly longer and more open than Standard Bengali",
      "The final 'o' in Standard Bengali words often becomes 'a' in Sylheti (ভালো → ভালা)",
      "Words ending in 'e' in Standard often end in 'i' in Sylheti",
      "Sylheti has a more melodic, rising intonation compared to Standard Bengali",
    ],
  },
  barisali: {
    nameBn: "বরিশালি",
    nameEn: "Barisali",
    color: "#0284c7",
    region: "Barisal Division",
    regionBn: "বরিশাল বিভাগ",
    speakers: "~9 million",
    about: "Barisali (বরিশালি) is the dialect of the Barisal Division in south-central Bangladesh. It is known for its musical, rhythmic quality and is closely associated with Bhatiyali folk songs. The dialect has a distinctive rising melody that sets it apart from other Bengali dialects.",
    differences: [
      { title: "হেই = He/She", desc: "Third person pronoun is হেই (hei) instead of Standard সে.", example: "হেই যায় = He/She goes" },
      { title: "কই = Where", desc: "Where is কই (koi) instead of Standard কোথায় (kothay).", example: "কই যাও? = Where are you going?" },
      { title: "কেমুন = How", desc: "How is কেমুন (kemun) instead of Standard কেমন (kemon).", example: "কেমুন আছ? = How are you?" },
      { title: "বাপ = Father", desc: "Father is commonly বাপ (bap) — more informal than Standard বাবা.", example: "বাপের নাম = Father's name" },
      { title: "চাইর = Four", desc: "Four is চাইর (chair) instead of Standard চার (char).", example: "চাইর জন = four people" },
      { title: "Musical intonation", desc: "Barisali has a distinctive rising-falling melody. Even simple sentences sound musical!", example: "কই যাও? has a long melodic rise on 'যাও'" },
    ],
    phrases: [
      { bangla: "কেমুন আছ?", roman: "Kemun ach?", english: "How are you?" },
      { bangla: "ভালাই আছি", roman: "Bhalai achi", english: "I am quite fine" },
      { bangla: "কই যাও?", roman: "Koi jao?", english: "Where are you going?" },
      { bangla: "বাড়ি যাই", roman: "Bari jai", english: "Going home" },
      { bangla: "কী খাইছ?", roman: "Ki khaich?", english: "What have you eaten?" },
      { bangla: "ভালো থাইক", roman: "Bhalo thaik", english: "Stay well (farewell)" },
      { bangla: "বাপ, শোনো", roman: "Bap, shono", english: "Father, listen" },
      { bangla: "দিদি আসছে", roman: "Didi ashche", english: "Older sister is coming" },
    ],
    pronunciationTips: [
      "Barisali has a naturally musical quality — embrace the rise and fall in pitch",
      "The 'e' sound at word endings often becomes 'i' (কেমন → কেমুন)",
      "Final consonants are often softer/less aspirated than in Standard Bengali",
      "Barisali speakers often stretch vowels for emphasis, especially in greetings",
    ],
  },
  chittagonian: {
    nameBn: "চাটগাঁইয়া",
    nameEn: "Chittagonian",
    color: "#d97706",
    region: "Chittagong Division",
    regionBn: "চট্টগ্রাম বিভাগ",
    speakers: "~13 million",
    about: "Chittagonian (চাটগাঁইয়া) is spoken in the Chittagong Division of southeast Bangladesh. It is considered so distinct that some linguists classify it as a separate language. It has ancient roots in Magadhi Prakrit. The port city of Chittagong has given it a cosmopolitan character.",
    differences: [
      { title: "আঁই = I", desc: "I is আঁই (ai) — completely different from Standard আমি! This is the most distinctive feature.", example: "আঁই যাই = I am going" },
      { title: "তুঁই = You (informal)", desc: "You is তুঁই (tui) instead of Standard তুমি (tumi).", example: "তুঁই কই গেলা? = Where did you go?" },
      { title: "হে = He/She", desc: "Third person is হে (he) — same as Sylheti!", example: "হে আসে = He/She comes" },
      { title: "আঁরা = We", desc: "We is আঁরা (ara) instead of Standard আমরা (amra).", example: "আঁরা যাই = We are going" },
      { title: "Unique vocabulary", desc: "Many words are completely different: বোইন = sister, আঁটা = eight, কেড্ডা = how/what's up.", example: "বোইন = sister (not বোন/আফা)" },
      { title: "Ancient Prakrit roots", desc: "Chittagonian preserves ancient Magadhi Prakrit vocabulary not found in other dialects.", example: "Many number words differ: চাইর (four), পাঁচ (five)" },
    ],
    phrases: [
      { bangla: "কেড্ডা আস?", roman: "Kedda as?", english: "How are you? (lit: How do you come?)" },
      { bangla: "ভালা আই", roman: "Bhala ai", english: "I am fine" },
      { bangla: "আঁই যাই", roman: "Ai jai", english: "I am going" },
      { bangla: "কিতা খাইলা?", roman: "Kita khaila?", english: "What did you eat?" },
      { bangla: "তুঁই কই গেলা?", roman: "Tui koi gela?", english: "Where did you go?" },
      { bangla: "আঁরা বাড়ি যাই", roman: "Ara bari jai", english: "We are going home" },
      { bangla: "বোইন, আস", roman: "Boin, as", english: "Sister, come" },
      { bangla: "আঁটা বছর", roman: "Ata bochor", english: "Eight years" },
    ],
    pronunciationTips: [
      "The nasal 'আঁ' sound (anusvara) is very important in Chittagonian — আঁই, আঁরা, তুঁই all have this nasal quality",
      "Many Standard Bengali 'ই' sounds become 'এ' sounds in Chittagonian",
      "Chittagonian has a distinctive tone — slightly more clipped than Standard Bengali",
      "The aspirated sounds (খ, ঘ, ছ etc.) are often less aspirated in Chittagonian",
    ],
  },
};

function PhraseCard({ phrase, color }: {
  phrase: { bangla: string; roman: string; english: string };
  color: string;
}) {
  return (
    <View style={[styles.phraseCard, { borderLeftColor: color }]}>
      <Text style={styles.phraseBangla}>{phrase.bangla}</Text>
      <Text style={[styles.phraseRoman, { color }]}>/{phrase.roman}/</Text>
      <Text style={styles.phraseEnglish}>{phrase.english}</Text>
    </View>
  );
}

export default function DialectGuideScreen() {
  const { dialect } = useLocalSearchParams<{ dialect: string }>();
  const router = useRouter();
  const data = DIALECT_DATA[dialect ?? "standard"] ?? DIALECT_DATA.standard;

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    trackScreenView(`dialect_${dialect ?? "standard"}`);
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 350, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, friction: 8, tension: 80, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <SafeAreaView style={styles.root}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: data.color }]}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 14 }}>
          <Text style={styles.headerSub}>Beginner Guide</Text>
          <Text style={styles.headerTitle}>{data.nameEn}</Text>
        </View>
        <View style={styles.headerBadge}>
          <Text style={styles.headerBadgeBn}>{data.nameEn}</Text>
        </View>
      </View>

      <Animated.ScrollView
        style={{ opacity: fadeAnim }}
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ transform: [{ translateY: slideAnim }] }}>

          {/* Hero card */}
          <View style={[styles.heroCard, { backgroundColor: data.color + "15", borderColor: data.color + "40" }]}>
            <Text style={[styles.heroNameBn, { color: data.color }]}>{data.nameBn}</Text>
            <View style={styles.heroMeta}>
              <View style={styles.heroMetaItem}>
                <Ionicons name="location-outline" size={14} color={data.color} />
                <Text style={styles.heroMetaText}>{data.region}</Text>
              </View>
              <View style={styles.heroMetaItem}>
                <Ionicons name="people-outline" size={14} color={data.color} />
                <Text style={styles.heroMetaText}>{data.speakers} speakers</Text>
              </View>
            </View>
            <Text style={styles.heroAbout}>{data.about}</Text>
          </View>

          {/* Key Differences */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionIcon, { backgroundColor: data.color + "20" }]}>
                <Ionicons name="git-compare-outline" size={18} color={data.color} />
              </View>
              <Text style={styles.sectionTitle}>Key Differences from Standard Bengali</Text>
            </View>
            {data.differences.map((d, i) => (
              <View key={i} style={styles.diffCard}>
                <View style={styles.diffHeader}>
                  <View style={[styles.diffNum, { backgroundColor: data.color }]}>
                    <Text style={styles.diffNumText}>{i + 1}</Text>
                  </View>
                  <Text style={styles.diffTitle}>{d.title}</Text>
                </View>
                <Text style={styles.diffDesc}>{d.desc}</Text>
                {d.example && (
                  <View style={[styles.diffExample, { borderLeftColor: data.color }]}>
                    <Text style={styles.diffExampleText}>{d.example}</Text>
                  </View>
                )}
              </View>
            ))}
          </View>

          {/* Signature Phrases */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionIcon, { backgroundColor: data.color + "20" }]}>
                <Ionicons name="chatbubbles-outline" size={18} color={data.color} />
              </View>
              <Text style={styles.sectionTitle}>Essential Phrases</Text>
            </View>
            <Text style={styles.sectionHint}>These phrases will help you start conversations right away.</Text>
            {data.phrases.map((p, i) => (
              <PhraseCard key={i} phrase={p} color={data.color} />
            ))}
          </View>

          {/* Pronunciation Tips */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionIcon, { backgroundColor: data.color + "20" }]}>
                <Ionicons name="volume-high-outline" size={18} color={data.color} />
              </View>
              <Text style={styles.sectionTitle}>Pronunciation Tips</Text>
            </View>
            {data.pronunciationTips.map((tip, i) => (
              <View key={i} style={styles.tipRow}>
                <View style={[styles.tipDot, { backgroundColor: data.color }]} />
                <Text style={styles.tipText}>{tip}</Text>
              </View>
            ))}
          </View>

          {/* CTA */}
          <TouchableOpacity
            style={[styles.ctaBtn, { backgroundColor: data.color }]}
            onPress={() => router.back()}
            activeOpacity={0.85}
          >
            <Ionicons name="play" size={18} color="#fff" />
            <Text style={styles.ctaBtnText}>Start Learning {data.nameEn}</Text>
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </Animated.View>
      </Animated.ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#f9fafb" },

  header: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 20, paddingVertical: 16,
  },
  headerSub: { color: "rgba(255,255,255,0.7)", fontSize: 11, fontWeight: "700", textTransform: "uppercase", letterSpacing: 1 },
  headerTitle: { color: "#fff", fontSize: 20, fontWeight: "800" },
  headerBadge: {
    backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 12,
    paddingHorizontal: 12, paddingVertical: 6,
  },
  headerBadgeBn: { color: "#fff", fontSize: 16, fontWeight: "800" },

  scroll: { padding: 16 },

  heroCard: {
    borderRadius: 20, padding: 20, marginBottom: 20,
    borderWidth: 1.5,
  },
  heroNameBn: { fontSize: 42, fontWeight: "900", marginBottom: 10 },
  heroMeta: { flexDirection: "row", gap: 16, marginBottom: 12, flexWrap: "wrap" },
  heroMetaItem: { flexDirection: "row", alignItems: "center", gap: 5 },
  heroMetaText: { fontSize: 13, fontWeight: "600", color: "#374151" },
  heroAbout: { fontSize: 14, color: "#6b7280", lineHeight: 22 },

  section: { marginBottom: 24 },
  sectionHeader: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 14 },
  sectionIcon: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  sectionTitle: { fontSize: 16, fontWeight: "800", color: "#1f2937", flex: 1 },
  sectionHint: { fontSize: 13, color: "#9ca3af", marginBottom: 12, lineHeight: 19 },

  diffCard: {
    backgroundColor: "#fff", borderRadius: 14, padding: 14,
    marginBottom: 10, borderWidth: 1, borderColor: "#f3f4f6",
  },
  diffHeader: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 6 },
  diffNum: { width: 22, height: 22, borderRadius: 11, alignItems: "center", justifyContent: "center" },
  diffNumText: { color: "#fff", fontSize: 11, fontWeight: "800" },
  diffTitle: { fontSize: 14, fontWeight: "800", color: "#1f2937", flex: 1 },
  diffDesc: { fontSize: 13, color: "#6b7280", lineHeight: 20, marginBottom: 8 },
  diffExample: {
    borderLeftWidth: 3, paddingLeft: 10, paddingVertical: 6,
    backgroundColor: "#f9fafb", borderRadius: 6,
  },
  diffExampleText: { fontSize: 13, color: "#374151", fontStyle: "italic" },

  phraseCard: {
    backgroundColor: "#fff", borderRadius: 14, padding: 14,
    marginBottom: 8, borderLeftWidth: 4, borderWidth: 1, borderColor: "#f3f4f6",
  },
  phraseBangla: { fontSize: 20, fontWeight: "900", color: "#1f2937", marginBottom: 3 },
  phraseRoman: { fontSize: 12, fontWeight: "700", marginBottom: 3 },
  phraseEnglish: { fontSize: 13, color: "#6b7280" },

  tipRow: { flexDirection: "row", alignItems: "flex-start", gap: 10, marginBottom: 10 },
  tipDot: { width: 8, height: 8, borderRadius: 4, marginTop: 6 },
  tipText: { flex: 1, fontSize: 14, color: "#374151", lineHeight: 21 },

  ctaBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 10, borderRadius: 18, paddingVertical: 18, marginTop: 8,
  },
  ctaBtnText: { color: "#fff", fontSize: 17, fontWeight: "800" },
});
