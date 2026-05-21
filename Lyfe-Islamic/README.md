# Lyfe · Islamic Edition

A single-file life simulator built on the Lyfe engine, set in an Islamic frame of reference. Every character is born Muslim by default. The player may stay on the path or deviate. Worldly consequences are simulated; **Allah's judgment is His alone** and is never depicted by the game.

Double-click `index.html` or open it in any browser. There is no build step, no music, no dependencies. Your save lives in `localStorage`; nothing is sent anywhere.

---

## What's different from secular Lyfe

| | Secular Lyfe | Islamic Edition |
|---|---|---|
| Default religion | Random / Secular | Islam |
| Names | Country-specific pool | Muslim names mixed into every country pool |
| Faith stat | Generic 0–100 | **Iman** 0–100, with named labels: Heedless / Weak / Wavering / Practicing / Strong |
| Music | Background MP3 | **Removed** |
| Banking | Conventional + Sharia available | Sharia banking surfaced by default for Muslim characters |
| Ethical decisions | Implicit | Explicit forks (halal vs haram) with reflection screen |
| Reflection screen | None | Quran ayah + Ibn Kathir tafsir summary + Sahih hadith on every major topic |
| Tawbah | None | Sincere repentance restores iman; legacy ledger still records the act |
| Nasl (progeny) | Random | Kids inherit faith state from parent — high-iman parent → spiritually-grounded children, low-iman parent → kids start weaker. **Choice remains the kid's.** |
| The seven destroyers | Generic crime tracker | Per Sahih al-Bukhari 2766 — shirk, sorcery, murder, riba, orphan's wealth, fleeing battle, slander of chaste women — tracked individually |
| Haram jobs | Generic | Bartender, drug dealer, lottery seller, escort, pimp etc. flagged for Muslim players |

---

## The references library

Every Quranic citation uses the **Sahih International** translation and is verifiable at [quran.com](https://quran.com). Every hadith is **sahih-graded** and pulled exclusively from the **Six Books** (Sahih al-Bukhari, Sahih Muslim, Sunan Abu Dawud, Jami at-Tirmidhi, Sunan an-Nasa'i, Sunan Ibn Majah). Every hadith citation links directly to [sunnah.com](https://sunnah.com) so you can verify externally.

Ibn Kathir tafsir summaries are paraphrased from his classical commentary, sourced via [alim.org](https://www.alim.org/quran/tafsir/ibn-kathir/) and the [quran.com tafsir collection](https://quran.com).

**No weak or fabricated (daif / mawdu) hadith are used.**

---

## Things the game will not do

- Pronounce on heaven or hell for any in-game outcome. The reckoning is Allah's alone. The reflection screen on every entry says so explicitly.
- Make sectarian claims. The Quran and the six sahih hadith collections are the corpus drawn from — no Sunni/Shia/madhab-specific fiqh debates are taken as canonical.
- Quote hadith without a sunnah.com reference number you can verify.
- Quote Ibn Kathir tafsir verbatim. All tafsir summaries are clearly labelled as paraphrased summaries; original consultation is encouraged.
- Replace ulema. This is a single-player video game intended for fiction + reflection. For binding rulings, ask a qualified scholar.

---

## How to play

Same controls as secular Lyfe:
- **SPACE** — age up one year
- **SHIFT+SPACE** — age up five years
- **Click a button on the bar** — open that menu
- **🤲 Tawbah button** appears for Muslim characters at any time
- **☪ Reflect button** opens the full references library

The Islamic-specific systems work alongside everything secular Lyfe has — companies, real estate, careers, family tree, foundation, dynasty inheritance. Run a business while practicing your faith; raise children who may follow your path or stray.

---

## License

MIT.

## Disclaimer

This is a fictional simulation game for educational and reflective purposes. References to Quran and Hadith are accurate but their interpretation is the reader's responsibility. For real-world religious guidance, consult a qualified scholar.

— WindowDoom
