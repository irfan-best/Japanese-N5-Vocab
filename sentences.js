const allSentences = {};

allSentences["Sentence 01"] = `
はじめまして。
How do you do? (lit. I am meeting you for the first time. Usually used as the first phrase when introducing oneself.)
hajimemashite
はじめまして。

どうぞ よろしく おねがいします。
Pleased to meet you. (lit. Please be nice to me. Usually used at the end of a self-introduction.)
yoroshiku
どうぞ よろしく おねがいします。

こちらは～さんです。
This is (someone).
kochira wa ~-san desu
こちらは～さんです。

おなまえは。
May i have your name?
onamae wa
おなまえは。

しつれいですが。
Excuse me, but (used when asking someone for personal information such as their name or address)
shitsurei desu ga
しつれいですが。

じこしょうかいをおねがいします。
Please introduce yourself. / Self-introduction please.
jiko shoukai o onegaishimasu
じこしょうかいをおねがいします。

わたしたちはマレーシアじんです。マレーシアからきました。
We are Malaysian. We come from Malaysia.
watashitachi wa Mareeshiajin desu. Mareeshia kara kimashita.
わたしたちはマレーシア人です。マレーシアからきました。

どなたがベトナムじんですか。
Who is Vietnamese?
donata ga Betonamujin desu ka.
どなたがベトナム人ですか。

あのひとはイタリアじんです。
That person is Italian.
anohito wa Itariajin desu.
あのひとはイタリア人です。

これはイタリアごです。
This is Italian.
kore wa Itariago desu.
これはイタリア語です。

あのかたはスペインじんです。
That person (polite) is Spanish.
anokata wa Supeinjin desu.
あのかたはスペイン人です。

これはスペインごです。
This is Spanish.
kore wa Supeingo desu.
これはスペイン語です。

わたしはアメリカじんです。
I am American.
watashi wa Amerikajin desu.
わたしはアメリカ人です。

あなたはインドネシアじんです。
You are Indonesian.
anata wa Indoneshiajin desu.
あなたはインドネシア人です。

これはインドネシアごです。
This is Indonesian.
kore wa Indoneshiago desu.
これはインドネシア語です。

みなさんはかんこくじんです。
Everyone is South Korean.
minasan wa Kankokujin desu.
みなさんは韓国人です。

これはかんこくごです。
This is Korean.
kore wa Kankokugo desu.
これは韓国語です。

だれがタイじんですか。
Who is Thai?
dare ga Taijin desu ka.
だれがタイ人ですか。

ちゅうごくじんはちゅうごくのひとです。
Chinese is a person from China.
Chuugokujin wa chuugoku no hito desu.
中国人はちゅうごくのひとです。

ドイツじんはドイツのひとです。
German is a person from Germany.
Doitsujin wa doitsu no hito desu.
ドイツ人はドイツのひとです。

にほんじんはにほんのひとです。
Japanese is a person from Japan.
Nihonjin wa nihon no hito desu.
日本人はにほんのひとです。

フランスじんはフランスのひとです。
French is a person from France.
Furansujin wa furansu no hito desu.
フランス人はフランスのひとです。

ブラジルじんはブラジルのひとです。
Brazilian is a person from Brazil.
Burajirujin wa burajiru no hito desu.
ブラジル人はブラジルのひとです。

メキシコじんはメキシコのひとです。
Mexican is a person from Mexico.
Mekishikojin wa Mekishiko no hito desu.
メキシコ人はメキシコのひとです。

イランじんはイランのひとです。
Iranian is a person from Iran.
Iranjin wa Iran no hito desu.
イラン人はイランのひとです。

エジプトじんはエジプトのひとです。
Egyptian is a person from Egypt.
Ejiputojin wa Ejiputo no hito desu.
エジプト人はエジプトのひとです。

カナダじんはカナダのひとです。
Canadian is a person from Canada.
Kanadajin wa Kanada no hito desu.
カナダ人はカナダのひとです。

イギリスじんはイギリスのひとです。
British is a person from U.K.
Igirisujin wa igirisu no hito desu.
イギリス人はイギリスのひとです。

オーストラリアじんはオーストラリアのひとです。
Australian is a person from Australia.
Oosutorariajin wa Oosutoraria no hito desu.
オーストラリア人はオーストラリアのひとです。

シンガポールじんはシンガポールのひとです。
Singaporean is a person from Singapore.
Shingapoorujin wa Shingapooru no hito desu.
シンガポール人はシンガポールのひとです。

サウジアラビアじんはサウジアラビアのひとです。
Saudi Arabian is a person from Saudi Arabia.
Saujiarabiajin wa Saujiarabia no hito desu.
サウジアラビア人はサウジアラビアのひとです。

フィリピンじんはフィリピンのひとです。
Filipino is a person from Philippines.
Firipinjin wa firipin no hito desu.
フィリピン人はフィリピンのひとです。

ロシアじんはロシアのひとです。
Russian is a person from Russia.
Roshiajin wa Roshia no hito desu.
ロシア人はロシアのひとです。

インドじんはインドのひとです。
Indian is a person from India.
Indojin wa indo no hito desu.
インド人はインドのひとです。

これはロシアごです。
This is Russian.
kore wa Roshiago desu.
これはロシア語です。

これはフランスごです。
This is French.
kore wa Furansugo desu.
これはフランス語です。

これはにほんごです。
This is Japanese.
kore wa Nihongo desu.
これは日本語です。

これはドイツごです。
This is German.
kore wa Doitsugo desu.
これはドイツ語です。

これはちゅうごくごです。
This is Chinese.
kore wa Chuugokugo desu.
これは中国語です。

これはタイごです。
This is Thai.
kore wa Taigo desu.
これはタイ語です。

これはベトナムごです。
This is Vietnamese.
kore wa Betonamugo desu.
これはベトナム語です。

これはマレーシアごです。
This is Malaysian.
kore wa Mareeshiago desu.
これはマレーシア語です。

これはえいごです。
This is English.
kore wa Eigo desu.
これは英語です。

これはポルトガルごです。
This is Portuguese.
kore wa Porutogarugo desu.
これはポルトガル語です。

これはペルシアごです。
This is Persian.
kore wa Perushiago desu.
これはペルシア語です。

これはアラビアごです。
This is Arabic.
kore wa Arabiago desu.
これはアラビア語です。

これはえいご・フランスごです。
This is English.
kore wa Eigo, Furansugo desu.
これは英語・フランス語です。

これはフィリピノごです。
This is Filipino.
kore wa Firipinogo desu.
これはフィリピノ語です。

これはヒンディーごです。
This is Hindi.
kore wa Hindiigo desu.
これはヒンディー語です。

たろうくんです。
This is Taro-kun.
tarou kun desu.
たろうくんです。

はなこちゃんです。
This is Hanako-chan.
hanako chan desu.
はなこちゃんです。

たなかさんです。
This is Tanaka-san.
tanaka san desu.
たなかさんです。

にほんじんです。
This uses the nationality suffix -jin (nihon-jin).
nihon jin desu.
にほんじんです。

IMCのしゃいんです。
An employee of IMC.
IMC no shain desu.
IMCのしゃいんです。

おいくつですか。なんさいですか。にじゅうさいです。
How old are you (formal)? How old? I am twenty years old.
oikutsu desu ka. nansai desu ka. nijuu sai desu.
おいくつですか。なんさいですか。にじゅうさいです。

はい、これはタイです。
This is Thailand.
hai, kore wa tai desu.
はい、これはタイです。

いいえ、これはかんこくです。
This is South Korea.
iie, kore wa kankoku desu.
いいえ、これはかんこくです。

これはインドネシアです。
This is Indonesia.
kore wa indoneshia desu.
これはインドネシアです。

これはアメリカです。
This is U.S.A.
kore wa amerika desu.
これはアメリカです。

これはスペインです。
This is Spain.
kore wa Supein desu.
これはスペインです。

これはイタリアです。
This is Italy.
kore wa Itaria desu.
これはイタリアです。

これはベトナムです。
This is Vietnam.
kore wa Betonamu desu.
これはベトナムです。

これはかいしゃいんです。
This is company employee.
kore wa kaishain desu.
これはかいしゃいんです。

これはびょういんです。
This is hospital.
kore wa byouin desu.
これはびょういんです。

これはでんきです。
This is electricity.
kore wa denki desu.
これはでんきです。

これはがくせいです。
This is student.
kore wa gakusei desu.
これはがくせいです。

これはいしゃです。
This is [medical] doctor.
kore wa isha desu.
これはいしゃです。

これはエンジニアです。
This is engineer.
kore wa enjinia desu.
これはエンジニアです。

これはだいがくです。
This is university.
kore wa daigaku desu.
これはだいがくです。

これはせんせいです。
This is teacher.
kore wa sensei desu.
これはせんせいです。

これはけんきゅうしゃです。
This is researcher.
kore wa kenkyuusha desu.
これはけんきゅうしゃです。

これはきょうしです。
This is teacher.
kore wa kyoushi desu.
これはきょうしです。

これはぎんこういんです。
This is bank employee.
kore wa ginkouin desu.
これはぎんこういんです。

`;

allSentences["Sentence 01 - Hard"] = ``;

allSentences["Sentence 02"] = `
そうですか。
I see.
sou desu ka
そうですか。

こちらこそよろしく。
I am pleased to meet you too.
kochirakoso yoroshiku
こちらこそよろしく。

これからおせわになります。
I hope for your kind assistance hereafter.
korekara osewa ni narimasu
これからおせわになります。

（どうも）ありがとうございます。
Thank you (very much).
(doumo) arigatou gozaimasu
（どうも）ありがとうございます。

ほんのきもちです。
It's nothing. / It's a token of my gratitude.
honno kimochi desu
ほんのきもちです。

これはえいごです。
This is the English language.
kore wa eigo desu.
これはえいごです。

これはにほんごです。
This is the Japanese language.
kore wa nihongo desu.
これはにほんごです。

にほんごです。
This uses the language suffix -go (nihon-go).
nihon go desu.
にほんごです。

ちがいます。
No it isn't. / You are wrong.
chigaimasu.
ちがいます。

これはほんです。
This/that is book.
kore wa hon desu.
これはほんです。

それはざっしです。
This/that is magazine.
sore wa zasshi desu.
それはざっしです。

あれはノートです。
This/that is notebook.
are wa nouto desu.
あれはノートです。

このカードです。
This/that .
kono kaado desu.
このカードです。

そのテレホンカードです。
This/that telephone card.
sono terehon kaado desu.
そのテレホンカードです。

あのボールペンです。
This/that ballpoint pen.
ano boorupen desu.
あのボールペンです。

あのう、これは（カセット）テープです。
This is .
anou, kore wa (kasetto) teepu desu.
あのう、これは（カセット）テープです。

そう、これはテープレコーダーです。
This is tape recorder.
sou, kore wa teepu rekoodaa desu.
そう、これはテープレコーダーです。

えっ、これはかぎです。
This is key.
e?, kore wa kagi desu.
えっ、これはかぎです。

あ、これはかさです。
This is umbrella.
a, kore wa kasa desu.
あ、これはかさです。

どうも、これはかばんです。
This is bag.
doumo, kore wa kaban desu.
どうも、これはかばんです。

どうぞ、これはテレビです。
This is television.
douzo, kore wa terebi desu.
どうぞ、これはテレビです。

これはラジオです。
This is radio.
kore wa rajio desu.
これはラジオです。

これはカメラです。
This is camera.
kore wa kamera desu.
これはカメラです。

これはコンピューターです。
This is computer.
kore wa konpyuutaa desu.
これはコンピューターです。

これはチョコレートです。
This is chocolate.
kore wa chokoreeto desu.
これはチョコレートです。

これはコーヒーです。
This is coffee.
kore wa kouhii desu.
これはコーヒーです。

これはなんです。
This is what~.
kore wa nan desu.
これはなんです。

これはおみやげです。
This is souvenir.
kore wa miyage desu.
これはおみやげです。

これはいすです。
This is chair.
kore wa isu desu.
これはいすです。

これはつくえです。
This is desk.
kore wa tsukue desu.
これはつくえです。

これはとけいです。
This is watch.
kore wa tokei desu.
これはとけいです。

これはてちょうです。
This is personal organiser.
kore wa techou desu.
これはてちょうです。

これはじどうしゃです。
This is automobile.
kore wa jidousha desu.
これはじどうしゃです。

これはシャープペンシルです。
This is mechanical pencil.
kore wa shaapupenshiru desu.
これはシャープペンシルです。

これはえんぴつです。
This is pencil.
kore wa enpitsu desu.
これはえんぴつです。

これはめいしです。
This is business card.
kore wa meishi desu.
これはめいしです。

これはしんぶんです。
This is newspaper.
kore wa shinbun desu.
これはしんぶんです。

これはじしょです。
This is dictionary.
kore wa jisho desu.
これはじしょです。

これはさとうです。
This is Sato.
kore wa satou desu.
これは佐藤です。

これはすずきです。
This is Suzuki.
kore wa suzuki desu.
これは鈴木です。

これはたかはしです。
This is Takahashi.
kore wa takahashi desu.
これは高橋です。

これはたなかです。
This is Tanaka.
kore wa tanaka desu.
これは田中です。

これはわたなべです。
This is Watanabe.
kore wa watanabe desu.
これは渡辺です。

これはいとうです。
This is Ito.
kore wa itou desu.
これは伊藤です。

これはやまもとです。
This is Yamamoto.
kore wa yamamoto desu.
これは山本です。

これはなかむらです。
This is Nakamura.
kore wa nakamura desu.
これは中村です。

これはこばやしです。
This is Kobayashi.
kore wa kobayashi desu.
これは小林です。

これはかとうです。
This is Kato.
kore wa katou desu.
これは加藤です。

これはよしだです。
This is Yoshida.
kore wa yoshida desu.
これは吉田です。

これはやまだです。
This is Yamada.
kore wa yamada desu.
これは山田です。

これはささきです。
This is Sasaki.
kore wa sasaki desu.
これは佐々木です。

これはさいとうです。
This is Saito.
kore wa saitou desu.
これは斎藤です。

これはやまぐちです。
This is Yamaguchi.
kore wa yamaguchi desu.
これは山口です。

これはまつもとです。
This is Matsumoto.
kore wa matsumoto desu.
これは松本です。

これはいのうえです。
This is Inoue.
kore wa inoue desu.
これは井上です。

これはきむらです。
This is Kimura.
kore wa kimura desu.
これは木村です。

これははやしです。
This is Hayashi.
kore wa hayashi desu.
これは林です。

これはしみずです。
This is Shimizu.
kore wa shimizu desu.
これは清水です。

`;

allSentences["Sentence 02 - Hard"] = ``;

allSentences["Sentence 03"] = `
〜をください。
Give me ~ please.
-o kudasai
〜をください。

〜でございます。
polite form of "desu"
-de gozaimasu
〜でございます。

〜をみせてください。
Please show me ~.
-o misete kudasai
〜をみせてください。

すみませんはここです。
Excuse me is here.
sumimasen wa koko desu.
すみませんはここです。

へやはそこです。
room is there.
heya wa soko desu.
へやはそこです。

いくらはあそこです。
how much is that place over there.
ikura wa asoko desu.
いくらはあそこです。

ワインはこちらです。
wine is this way.
wain wa kochira desu.
ワインはこちらです。

タバコはそちらです。
tobacco is that way.
tabako wa sochira desu.
タバコはそちらです。

ロビーはあちらです。
lobby is that way.
robii wa achira desu.
ロビーはあちらです。

エレベーターはどこです。
elevator is where.
erebeetaa wa doko desu.
エレベーターはどこです。

ネクタイはどちらです。
necktie is which way.
nekutai wa dochira desu.
ネクタイはどちらです。

じゃ、これはかい・がい・っかいです。
This is -th floor.
ja, kore wa kai / -gai / -kkai desu.
じゃ、これはかい・がい・っかいです。

これはえんです。
This is -yen.
kore wa en desu.
これはえんです。

これはトイレです。
This is toilet.
kore wa toire desu.
これはトイレです。

これはエスカレーターです。
This is escalator.
kore wa esukareetaa desu.
これはエスカレーターです。

これはちかです。
This is basement.
kore wa chika desu.
これはちかです。

これはまんです。
This is ten thousand.
kore wa man desu.
これはまんです。

これはちかいっかいです。
This is Basement 1.
kore wa chika ikkai desu.
これはちかいっかいです。

これはちかにかいです。
This is Basement 2.
kore wa chika nikai desu.
これはちかにかいです。

これはちかさんがいです。
This is Basement 3.
kore wa chika sangai desu.
これはちかさんがいです。

これはちかよんかいです。
This is Basement 4.
kore wa chika yonkai desu.
これはちかよんかいです。

これはちかごかいです。
This is Basement 5.
kore wa chika gokai desu.
これはちかごかいです。

これはちかろっかいです。
This is Basement 6.
kore wa chika rokkai desu.
これはちかろっかいです。

これはちかななかいです。
This is Basement 7.
kore wa chika nanakai desu.
これはちかななかいです。

これはちかはっかいです。
This is Basement 8.
kore wa chika hakkai desu.
これはちかはっかいです。

これはちかきゅうかいです。
This is Basement 9.
kore wa chika kyūkai desu.
これはちかきゅうかいです。

これはちかじゅっかいです。
This is Basement 10.
kore wa chika jukkai desu.
これはちかじゅっかいです。

これはちかじゅういっかいです。
This is Basement 11.
kore wa chika juuikkai desu.
これはちかじゅういっかいです。

これはひゃくです。
This is 100.
kore wa hyaku desu.
これはひゃくです。

これはにひゃくです。
This is 200.
kore wa nihyaku desu.
これはにひゃくです。

これはさんびゃくです。
This is 300.
kore wa sanbyaku desu.
これはさんびゃくです。

これはよんひゃくです。
This is 400.
kore wa yonhyaku desu.
これはよんひゃくです。

これはごひゃくです。
This is 500.
kore wa gohyaku desu.
これはごひゃくです。

これはろっぴゃくです。
This is 600.
kore wa roppyaku desu.
これはろっぴゃくです。

これはななひゃくです。
This is 700.
kore wa nanahyaku desu.
これはななひゃくです。

これははっぴゃくです。
This is 800.
kore wa happyaku desu.
これははっぴゃくです。

これはきゅうひゃくです。
This is 900.
kore wa kyūhyaku desu.
これはきゅうひゃくです。

これはせんです。
This is 1000.
kore wa sen desu.
これはせんです。

これはにせんです。
This is 2000.
kore wa ni sen desu.
これはにせんです。

これはさんぜんです。
This is 3000.
kore wa sanzen desu.
これはさんぜんです。

これはよんせんです。
This is 4000.
kore wa yon sen desu.
これはよんせんです。

これはごせんです。
This is 5000.
kore wa go sen desu.
これはごせんです。

これはろくせんです。
This is 6000.
kore wa roku sen desu.
これはろくせんです。

これはななせんです。
This is 7000.
kore wa nana sen desu.
これはななせんです。

これははっせんです。
This is 8000.
kore wa hassen desu.
これははっせんです。

これはきゅうせんです。
This is 9000.
kore wa kyuu sen desu.
これはきゅうせんです。

これはいちまんです。
This is 10 K.
kore wa ichiman desu.
これはいちまんです。

これはにまんです。
This is 20K.
kore wa niman desu.
これはにまんです。

これはさんまんです。
This is 30K.
kore wa sanman desu.
これはさんまんです。

これはよんまんです。
This is 40.
kore wa yonman desu.
これはよんまんです。

これはごまんです。
This is 50000.
kore wa goman desu.
これはごまんです。

これはろくまんです。
This is 60K.
kore wa rokuman desu.
これはろくまんです。

これはななまんです。
This is 70K.
kore wa nanaman desu.
これはななまんです。

これははちまんです。
This is 80000.
kore wa hachiman desu.
これははちまんです。

これはきゅうまんです。
This is 90K.
kore wa kyuuman desu.
これはきゅうまんです。

これはじゅうまんです。
This is 100K.
kore wa juuman desu.
これはじゅうまんです。

これはじゅういちまんです。
This is 110 K.
kore wa juuichiman desu.
これはじゅういちまんです。

これはひゃくまんです。
This is 1 Million.
kore wa hyakuman desu.
これはひゃくまんです。

これはせんまんです。
This is 10M.
kore wa senman desu.
これはせんまんです。

これはきゅうせんきゅうひゃくきゅうじゅうきゅうまんきゅうせんきゅうひゃくきゅうじゅうきゅうです。
This is 99 999 999.
kore wa kyuusen kyuuhyaku kyuujuu kyuuman kyuusen kyuuhyaku kyuujuu kyuu desu.
これはきゅうせんきゅうひゃくきゅうじゅうきゅうまんきゅうせんきゅうひゃくきゅうじゅうきゅうです。

これはジャカルタです。
This is Jakarta.
kore wa jakaruta desu.
これはジャカルタです。

これはベルリンです。
This is Berlin.
kore wa berurin desu.
これはベルリンです。

これは新大阪です。
This is Shin-Osaka.
kore wa shin-oosaka desu.
これは新大阪です。

これはじどうはんばいきです。
This is vending machine.
kore wa jidouhanbaiki desu.
これはじどうはんばいきです。

これはかいぎしつです。
This is meeting room.
kore wa kaigishitsu desu.
これはかいぎしつです。

これはかいだんです。
This is staircase.
kore wa kaidan desu.
これはかいだんです。

これはしょくどうです。
This is dining hall.
kore wa shokudou desu.
これはしょくどうです。

これはじむしょです。
This is office.
kore wa jimusho desu.
これはじむしょです。

これはきょうしつです。
This is classroom.
kore wa kyoushitsu desu.
これはきょうしつです。

これはおてあらいです。
This is toilet.
kore wa otearai desu.
これはおてあらいです。

これはうけつけです。
This is reception desk.
kore wa uketsuke desu.
これはうけつけです。

これはうりばです。
This is department.
kore wa uriba desu.
これはうりばです。

これはなんかいです。
This is what floor.
kore wa nankai desu.
これはなんかいです。

これはでんわです。
This is telephone handset.
kore wa denwa desu.
これはでんわです。

これはイタリアです。
This is Italy.
kore wa itaria desu.
これはイタリアです。

これはスイスです。
This is Switzerland.
kore wa suisu desu.
これはスイスです。

これはアクセサリーです。
This is accessories.
kore wa akusesarii desu.
これはアクセサリーです。

これはちゅうしゃじょうです。
This is car park / parking lot.
kore wa chuushajou desu.
これは駐車場です。

これはレストランです。
This is restaurant.
kore wa resutoran desu.
これはレストランです。

これはとけいです。
This is watch.
kore wa tokei desu.
これは時計です。

これはめがねです。
This is spectacles.
kore wa megane desu.
これは眼鏡です。

これはほんです。
This is book.
kore wa hon desu.
これは本です。

これはくつです。
This is shoes.
kore wa kutsu desu.
これは靴です。

これはかばんです。
This is bag.
kore wa kaban desu.
これはかばんです。

これはおくじょうゆうえんちです。
This is amusement area.
kore wa okujou yuuenchi desu.
これは屋上遊園地です。

これはもよおしものかいじょうです。
This is event hall.
kore wa moyooshimono kaijou desu.
これは催し物会場です。

これはおもちゃです。
This is toy.
kore wa omocha desu.
これはおもちゃです。

これはぶんぼうぐです。
This is stationery.
kore wa bunbougu desu.
これは文房具です。

これはかぐです。
This is furniture.
kore wa kagu desu.
これは家具です。

これはしょっきです。
This is tableware / kitchenware.
kore wa shokki desu.
これは食器です。

これはしんしふくです。
This is men's wear.
kore wa shinshifuku desu.
これは紳士服です。

これはふじんふくです。
This is ladies' wear.
kore wa fujinfuku desu.
これは婦人服です。

これはけしょうひんです。
This is cosmetics.
kore wa keshouhin desu.
これは化粧品です。

これはスポーツようひんです。
This is sporting goods.
kore wa supootsu youhin desu.
これはスポーツ用品です。

これはりょこうようひんです。
This is leisure goods / travel goods.
kore wa ryokou youhin desu.
これは旅行用品です。

これはでんかせいひんです。
This is electrical appliances.
kore wa denka seihin desu.
これは電化製品です。

これはしょくひんです。
This is food.
kore wa shokuhin desu.
これは食品です。

これはこどもふくです。
This is children's clothes.
kore wa kodomofuku desu.
これは子ども服です。

`;

allSentences["Sentence 03 - Hard"] = ``;

allSentences["Sentence 04"] = `
おねがいします。
Please. (ask for a favor)
onegaishimasu
おねがいします。

これはごごです。
This is p.m.
kore wa gogo desu.
これはごごです。

けさにおきます。
get up this morning.
kesa ni okimasu.
けさにおきます。

デパートをねます。
sleep department store.
depaato o nemasu.
デパートをねます。

やすみます。
take a rest.
yasumimasu.
やすみます。

ぎんこうをべんきょうします。
study bank.
ginkou o benkyoushimasu.
ぎんこうをべんきょうします。

いまをおわります。
finish now.
ima o owarimasu.
いまをおわります。

はんにはたらきます。
work half.
han ni hatarakimasu.
はんにはたらきます。

なんじはそちらです。
what time is your place.
nanji wa sochira desu.
なんじはそちらです。

これはからです。
This is from~.
kore wa kara desu.
これはからです。

これはまでです。
This is up to~.
kore wa made desu.
これはまでです。

これはじです。
This is -o'clock.
kore wa ji desu.
これはじです。

これはふん・ぷんです。
This is -minute.
kore wa fun / ~pun desu.
これはふん・ぷんです。

これはなんぷんです。
This is what minute.
kore wa nanpun desu.
これはなんぷんです。

これはあさです。
This is morning.
kore wa asa desu.
これはあさです。

これはひるです。
This is daytime.
kore wa hiru desu.
これはひるです。

これはばん・よるです。
This is night.
kore wa ban / yoru desu.
これはばん・よるです。

これはあしたです。
This is tomorrow.
kore wa ashita desu.
これはあしたです。

これはあさってです。
This is the day after tomorrow.
kore wa asatte desu.
これはあさってです。

これはこんばんです。
This is this evening.
kore wa konban desu.
これはこんばんです。

これはやすみです。
This is rest.
kore wa yasumi desu.
これはやすみです。

これはひるやすみです。
This is lunchtime.
kore wa hiruyasumi desu.
これはひるやすみです。

これはまいあさです。
This is every morning.
kore wa maiasa desu.
これはまいあさです。

これはまいばんです。
This is every night.
kore wa maiban desu.
これはまいばんです。

これはまいにちです。
This is every day.
kore wa mainichi desu.
これはまいにちです。

これはなんようびです。
This is what day of the week.
kore wa nanyoubi desu.
これはなんようびです。

これはとです。
This is and.
kore wa to desu.
これはとです。

これはたいへんですねです。
This is That's tough.
kore wa taihen desu ne desu.
これはたいへんですねです。

これはえーとです。
This is well.
kore wa eeto desu.
これはえーとです。

これはニューヨークです。
This is New York.
kore wa nyuuyooku desu.
これはニューヨークです。

これはロンドンです。
This is London.
kore wa rondon desu.
これはロンドンです。

これはバンコクです。
This is Bangkok.
kore wa bankoku desu.
これはバンコクです。

これはいちじです。
This is 1 o'clock.
kore wa ichiji desu.
これはいちじです。

これはにじです。
This is 2 o'clock.
kore wa niji desu.
これはにじです。

これはさんじです。
This is 3 o'clock.
kore wa sanji desu.
これはさんじです。

これはよじです。
This is 4 o'clock.
kore wa yoji desu.
これはよじです。

これはごじです。
This is 5 o'clock.
kore wa goji desu.
これはごじです。

これはろくじです。
This is 6 o'clock.
kore wa rokuji desu.
これはろくじです。

これはしちじです。
This is 7 o'clock.
kore wa shichiji desu.
これはしちじです。

これははちじです。
This is 8 o'clock.
kore wa hachiji desu.
これははちじです。

これはくじです。
This is 9 o'clock.
kore wa kuji desu.
これはくじです。

これはじゅうじです。
This is 10 o'clock.
kore wa juuji desu.
これはじゅうじです。

これはじゅういちじです。
This is 11 o'clock.
kore wa juuichiji desu.
これはじゅういちじです。

これはじゅうにじです。
This is 12 o'clock.
kore wa juuniji desu.
これはじゅうにじです。

これはいっぷんです。
This is 1 minute.
kore wa ippun desu.
これはいっぷんです。

これはにふんです。
This is 2 minutes.
kore wa nifun desu.
これはにふんです。

これはさんぷんです。
This is 3 minutes.
kore wa sanpun desu.
これはさんぷんです。

これはよんぷんです。
This is 4 minutes.
kore wa yonpun desu.
これはよんぷんです。

これはごふんです。
This is 5 minutes.
kore wa gofun desu.
これはごふんです。

これはろっぷんです。
This is 6 minutes.
kore wa roppun desu.
これはろっぷんです。

これはななふん(or)しちふんです。
This is 7 minutes.
kore wa nanafun / shichifun desu.
これはななふん(or)しちふんです。

これははっぷんです。
This is 8 minutes.
kore wa happun desu.
これははっぷんです。

これはきゅうふんです。
This is 9 minutes.
kore wa kyuufun desu.
これはきゅうふんです。

これはじゅっぷん(or)じゅうっぷんです。
This is 10 minutes.
kore wa juppun / juuppun desu.
これはじゅっぷん(or)じゅうっぷんです。

これはじゅういっぷんです。
This is 11 minutes.
kore wa jūippun desu.
これはじゅういっぷんです。

これはおといあわせのばんごうです。
This is the number being inquired about.
kore wa otoiawase no bangou desu.
これはおといあわせのばんごうです。

これはびじゅつかんです。
This is art museum.
kore wa bijutsukan desu.
これはびじゅつかんです。

これはとしょかんです。
This is library.
kore wa toshokan desu.
これはとしょかんです。

これはゆうびんきょくです。
This is post office.
kore wa yuubinkyoku desu.
これはゆうびんきょくです。

これはロサンゼルスです。
This is Los Angeles.
kore wa rosanzerusu desu.
これはロサンゼルスです。

これはペキンです。
This is Beijing.
kore wa pekin desu.
これはペキンです。

これはおとといです。
This is the day before yesterday.
kore wa ototoi desu.
これはおとといです。

これはごぜんです。
This is a.m.
kore wa gozen desu.
これはごぜんです。

これはかしこまりましたです。
This is Certainly.
kore wa kashikomarimashita desu.
これはかしこまりましたです。

これはなんばんです。
This is what number.
kore wa nanban desu.
これはなんばんです。

これはばんごうです。
This is number.
kore wa bangou desu.
これはばんごうです。

これはきょうです。
This is today.
kore wa kyou desu.
これはきょうです。

これはきのうです。
This is yesterday.
kore wa kinou desu.
これはきのうです。

これはにちようびです。
This is Sunday.
kore wa nichiyoubi desu.
これはにちようびです。

これはげつようびです。
This is Monday.
kore wa getsuyoubi desu.
これはげつようびです。

これはかようびです。
This is Tuesday.
kore wa kayoubi desu.
これはかようびです。

これはすいようびです。
This is Wednesday.
kore wa suiyoubi desu.
これはすいようびです。

これはもくようびです。
This is Thursday.
kore wa mokuyoubi desu.
これはもくようびです。

これはきんようびです。
This is Friday.
kore wa kinyoubi desu.
これはきんようびです。

これはどようびです。
This is Saturday.
kore wa doyoubi desu.
これはどようびです。

これはけいさつしょです。
This is police station.
kore wa keisatsusho desu.
これは警察署です。

これはしょうぼうしょです。
This is fire/ambulance station.
kore wa shoubousho desu.
これは消防署です。

これはじほうです。
This is time signal.
kore wa jihou desu.
これは時報です。

これはてんきよほうです。
This is weather forecast.
kore wa tenki yohou desu.
これは天気予報です。

これはでんわばんごうあんないです。
This is directory inquiries.
kore wa denwa bangou annai desu.
これは電話番号案内です。

これはひょうごけんです。
This is Hyogo Prefecture.
kore wa hyougoken desu.
これは兵庫県です。

これはこうべしです。
This is Kobe City.
kore wa koubeshi desu.
これは神戸市です。

これはちゅうおうくです。
This is Chuo Ward.
kore wa chuuouku desu.
これは中央区です。

これはさんのみやです。
This is Sannomiya.
kore wa sannomiya desu.
これは三宮です。

これはごうです。
This is apartment number.
kore wa gou desu.
これは号です。

`;

allSentences["Sentence 04 - Hard"] = ``;

allSentences["Sentence 05"] = `
かぞくはでんしゃです。
family is train.
kazoku wa densha desu.
かぞくはでんしゃです。

いつにいきます。
go when.
itsu ni ikimasu.
いつにいきます。

がっこうにきます。
come school.
gakkou ni kimasu.
がっこうにきます。

えきにかえります。
go home station.
eki ni kaerimasu.
えきにかえります。

これはちかてつです。
This is subway.
kore wa chikatetsu desu.
これはちかてつです。

これはバスです。
This is bus.
kore wa basu desu.
これはバスです。

これはタクシーです。
This is taxi.
kore wa takushii desu.
これはタクシーです。

これはひとです。
This is person.
kore wa hito desu.
これはひとです。

これはともだちです。
This is friend.
kore wa tomodachi desu.
これはともだちです。

これはかれです。
This is he.
kore wa kare desu.
これはかれです。

これはかのじょです。
This is she.
kore wa kanojo desu.
これはかのじょです。

これはひとりでです。
This is alone.
kore wa hitoride desu.
これはひとりでです。

これはせんしゅうです。
This is last week.
kore wa senshuu desu.
これはせんしゅうです。

これはこんしゅうです。
This is this week.
kore wa konshuu desu.
これはこんしゅうです。

これはらいしゅうです。
This is next week.
kore wa raishuu desu.
これはらいしゅうです。

これはにちです。
This is ~th day of the month.
kore wa nichi desu.
これはにちです。

これはなんにちです。
This is which day of the month.
kore wa nannichi desu.
これはなんにちです。

これはたんじょうびです。
This is birthday.
kore wa tanjoubi desu.
これはたんじょうびです。

これはつぎです。
This is next.
kore wa tsugi desu.
これはつぎです。

これはつぎのでんしゃです。
This is next train.
kore wa tsugino densha desu.
これはつぎのでんしゃです。

これはスーパーです。
This is super market.
kore wa suupaa desu.
これはスーパーです。

これはいちがつです。
This is January.
kore wa ichigatsu desu.
これはいちがつです。

これはにがつです。
This is February.
kore wa nigatsu desu.
これはにがつです。

これはさんがつです。
This is March.
kore wa sangatsu desu.
これはさんがつです。

これはしがつです。
This is April.
kore wa shigatsu desu.
これはしがつです。

これはごがつです。
This is May.
kore wa gogatsu desu.
これはごがつです。

これはろくがつです。
This is June.
kore wa rokugatsu desu.
これはろくがつです。

これはしちがつです。
This is July.
kore wa shichigatsu desu.
これはしちがつです。

これははちがつです。
This is August.
kore wa hachigatsu desu.
これははちがつです。

これはくがつです。
This is September.
kore wa kugatsu desu.
これはくがつです。

これはじゅうがつです。
This is October.
kore wa juugatsu desu.
これはじゅうがつです。

これはじゅういちがつです。
This is November.
kore wa juuichigatsu desu.
これはじゅういちがつです。

これはじゅうにがつです。
This is December.
kore wa juunigatsu desu.
これはじゅうにがつです。

これはひこうきです。
This is airplane.
kore wa hikouki desu.
これはひこうきです。

これはふつうです。
This is local.
kore wa futsuu desu.
これはふつうです。

これはきゅうこうです。
This is Rapid.
kore wa kyuukou desu.
これはきゅうこうです。

これはとっきゅうです。
This is Express.
kore wa tokkyuu desu.
これはとっきゅうです。

これはしんかんせんです。
This is bullet train.
kore wa shinkansen desu.
これはしんかんせんです。

これはじてんしゃです。
This is bicycle.
kore wa jitensha desu.
これはじてんしゃです。

これはあるいてです。
This is on foot.
kore wa aruite desu.
これはあるいてです。

これはばんせんです。
This is platform ~.
kore wa bansen desu.
これはばんせんです。

これはどういたしましてです。
This is You're welcome. Don't mention it.
kore wa dou itashimashite desu.
これはどういたしましてです。

これはらいねんです。
This is next year.
kore wa rainen desu.
これはらいねんです。

これはことしです。
This is this year.
kore wa kotoshi desu.
これはことしです。

これはきょねんです。
This is last year.
kore wa kyonen desu.
これはきょねんです。

これはらいげつです。
This is next month.
kore wa raigetsu desu.
これはらいげつです。

これはこんげつです。
This is this month.
kore wa kongetsu desu.
これはこんげつです。

これはついたちです。
This is first day of the month.
kore wa tsuitachi desu.
これはついたちです。

これはふつかです。
This is second day.
kore wa futsuka desu.
これはふつかです。

これはみっかです。
This is third day of the month.
kore wa mikka desu.
これはみっかです。

これはよっかです。
This is fourth day of the month.
kore wa yokka desu.
これはよっかです。

これはいつかです。
This is fifth day of the month.
kore wa itsuka desu.
これはいつかです。

これはむいかです。
This is sixth day of the month.
kore wa muika desu.
これはむいかです。

これはなのかです。
This is seventh day of the month.
kore wa nanoka desu.
これはなのかです。

これはようかです。
This is eighth day of the month.
kore wa youka desu.
これはようかです。

これはここのかです。
This is ninth day of the month.
kore wa kokonoka desu.
これはここのかです。

これはとおかです。
This is tenth day of the month.
kore wa tooka desu.
これはとおかです。

これはじゅういちにちです。
This is Eleventh day of the month.
kore wa juichi-nichi desu.
これはじゅういちにちです。

これはじゅうよっかです。
This is fourteenth day of the month.
kore wa juuyokka desu.
これはじゅうよっかです。

これははつかです。
This is twentieth day of the month.
kore wa hatsuka desu.
これははつかです。

これはにじゅうよっかです。
This is twenty fourth day of the month.
kore wa nijuuyokka desu.
これはにじゅうよっかです。

これはなんがつです。
This is what month.
kore wa nangatsu desu.
これはなんがつです。

これはふねです。
This is ship.
kore wa fune desu.
これはふねです。

これはがつです。
This is ~th month of the year.
kore wa gatsu desu.
これはがつです。

これはうみのひです。
This is Marine Day.
kore wa umi no hi desu.
これは海の日です。

これはしょうわのひです。
This is Showa Day.
kore wa shouwa no hi desu.
これは昭和の日です。

これはみどりのひです。
This is Greenery Day.
kore wa midori no hi desu.
これはみどりの日です。

これはこどものひです。
This is Children's Day.
kore wa kodomo no hi desu.
これはこどもの日です。

これはやまのひです。
This is Mountain Day.
kore wa yama no hi desu.
これは山の日です。

これはゴールデンウィークです。
This is Golden Week.
kore wa gooruden wiiku desu.
これはゴールデンウィークです。

これはけんぽうきねんびです。
This is Constitution Memorial Day.
kore wa kenpou kinenbi desu.
これは憲法記念日です。

これはしゅくさいじつです。
This is national holiday.
kore wa shukusaijitsu desu.
これは祝祭日です。

これはがんじつです。
This is New Year's Day.
kore wa ganjitsu desu.
これは元日です。

これはけんこくきねんのひです。
This is National Foundation Day.
kore wa kenkoku kinen no hi desu.
これは建国記念の日です。

これはけいろうのひです。
This is Respect-for-the-Aged Day.
kore wa keirou no hi desu.
これは敬老の日です。

これはきんろうかんしゃのひです。
This is Labour Thanksgiving Day.
kore wa kinrou kansha no hi desu.
これは勤労感謝の日です。

これはしゅんぶんのひです。
This is Vernal Equinox Day.
kore wa shunbun no hi desu.
これは春分の日です。

これはしゅうぶんのひです。
This is Autumnal Equinox Day.
kore wa shuubun no hi desu.
これは秋分の日です。

これはてんのうたんじょうびです。
This is The Emperor's Birthday.
kore wa tennou tanjoubi desu.
これは天皇誕生日です。

これはせいじんのひです。
This is Coming-of-Age Day.
kore wa seijin no hi desu.
これは成人の日です。

これはいちがつのだいにげつようびです。
This is 2nd Monday of January.
kore wa ichigatsu no dai-ni getsuyoubi desu.
これは1月の第2月曜日です。

これはたいいくのひです。
This is Health and Sports Day.
kore wa taiiku no hi desu.
これは体育の日です。

これはぶんかのひです。
This is Culture Day.
kore wa bunka no hi desu.
これは文化の日です。

`;

allSentences["Sentence 05 - Hard"] = ``;

allSentences["Sentence 06"] = `
なんですか。
Yes? (lit: What is it?)
nan desu ka
なんですか。

にんじんです。
This person is carrot.
ninjin desu.
にんじんです。

これはたまごです。
This is egg.
kore wa tamago desu.
これはたまごです。

これはいちごです。
This is strawberry.
kore wa ichigo desu.
これはいちごです。

これはりんごです。
This is apple.
kore wa ringo desu.
これはりんごです。

ええをたべます。
eat yes.
ee o tabemasu.
ええをたべます。

わかりましたをのみます。
drink Ok i understand.
wakarimashita o nomimasu.
わかりましたをのみます。

いつもにききます。
hear always.
itsumo ni kikimasu.
いつもにききます。

それからをよみます。
read after than.
sorekara o yomimasu.
それからをよみます。

かいます。
buy.
kaimasu.
かいます。

ちょっとをします。
do a little while.
chotto o shimasu.
ちょっとをします。

すいます。
smoke.
suimasu.
すいます。

ときどきをとります。
take sometimes.
tokidoki o torimasu.
ときどきをとります。

いいですねにかきます。
write that's good.
ii desu ne ni kakimasu.
いいですねにかきます。

じゃ、またをみます。
see well then See you [tomorrow].
ja mata o mimasu.
じゃ、またをみます。

あいます。
meet.
aimasu.
あいます。

ごはんをおはなみをします。
view the cherry blossoms a meal.
gohan o ohanami o shimasu.
ごはんをおはなみをします。

これはあさごはんです。
This is breakfast.
kore wa asagohan desu.
これはあさごはんです。

これはひるごはんです。
This is lunch.
kore wa hirugohan desu.
これはひるごはんです。

これはばんごはんです。
This is supper.
kore wa bangohan desu.
これはばんごはんです。

これはパンです。
This is bread.
kore wa pan desu.
これはパンです。

これはにくです。
This is meat.
kore wa niku desu.
これはにくです。

これはさかなです。
This is fish.
kore wa sakana desu.
これはさかなです。

これはみずです。
This is water.
kore wa mizu desu.
これはみずです。

これはおちゃです。
This is tea.
kore wa ocha desu.
これはおちゃです。

これはこうちゃです。
This is black tea.
kore wa koucha desu.
これはこうちゃです。

これはジュースです。
This is juice.
kore wa juusu desu.
これはジュースです。

これはビールです。
This is beer.
kore wa biiru desu.
これはビールです。

これは（お）さけです。
This is alcohol.
kore wa (o)sake desu.
これは（お）さけです。

これはビデオです。
This is video [tape].
kore wa bideo desu.
これはビデオです。

これはえいがです。
This is movie.
kore wa eiga desu.
これはえいがです。

これはCDです。
This is CD.
kore wa shii dii desu.
これはCDです。

これはレポートです。
This is report.
kore wa repooto desu.
これはレポートです。

これはみせです。
This is store.
kore wa mise desu.
これはみせです。

これはレストランです。
This is restaurant.
kore wa resutoran desu.
これはレストランです。

これはテニスです。
This is tennis.
kore wa tenisu desu.
これはテニスです。

これはサッカーです。
This is soccer.
kore wa sakkaa desu.
これはサッカーです。

これはなにです。
This is what.
kore wa nani desu.
これはなにです。

これはメキシコです。
This is Mekishiko.
kore wa Mexico desu.
これはメキシコです。

これはくだものです。
This is fruit.
kore wa kudamono desu.
これはくだものです。

これはぎゅうにゅう・ミルクです。
This is milk.
kore wa gyuunyuu / miruku desu.
これはぎゅうにゅう・ミルクです。

これはやさいです。
This is vegetable.
kore wa yasai desu.
これはやさいです。

これはてがみです。
This is letter.
kore wa tegami desu.
これはてがみです。

これはしゃしんです。
This is photograph.
kore wa shashin desu.
これはしゃしんです。

これはにわです。
This is garden.
kore wa niwa desu.
これはにわです。

これはしゅくだいです。
This is homework.
kore wa shukudai desu.
これはしゅくだいです。

これはおはなみです。
This is cherry blossom viewing.
kore wa (o) hanami desu.
これは（お）はなみです。

これはいっしょにです。
This is together.
kore wa isshoni desu.
これはいっしょにです。

これはキャベツです。
This is cabbage.
kore wa kyabetsu desu.
これはキャベツです。

これはさけです。
This is salmon.
kore wa sake desu.
これはさけです。

これはレタスです。
This is lettuce.
kore wa retasu desu.
これはレタスです。

これはももです。
This is peach.
kore wa momo desu.
これはももです。

これはぎゅうにくです。
This is beef.
kore wa gyuuniku desu.
これは牛肉です。

これはとりにくです。
This is chicken.
kore wa toriniku desu.
これは鶏肉です。

これはぶたにくです。
This is pork.
kore wa butaniku desu.
これは豚肉です。

これはソーセージです。
This is sausage.
kore wa sooseeji desu.
これはソーセージです。

これはたまねぎです。
This is onion.
kore wa tamanegi desu.
これはたまねぎです。

これはねぎです。
This is spring onion / scallion.
kore wa negi desu.
これはねぎです。

これはすいかです。
This is watermelon.
kore wa suika desu.
これはすいかです。

これはたこです。
This is octopus.
kore wa tako desu.
これはたこです。

これはトマトです。
This is tomato.
kore wa tomato desu.
これはトマトです。

これはみかんです。
This is mandarin orange.
kore wa mikan desu.
これはみかんです。

これはバナナです。
This is banana.
kore wa banana desu.
これはバナナです。

これはハムです。
This is ham.
kore wa hamu desu.
これはハムです。

これはきゅうりです。
This is cucumber.
kore wa kyuuri desu.
これはきゅうりです。

これははくさいです。
This is Chinese cabbage.
kore wa hakusai desu.
これは白菜です。

これはほうれんそうです。
This is spinach.
kore wa hourensou desu.
これはほうれんそうです。

これはじゃがいもです。
This is potato.
kore wa jagaimo desu.
これはじゃがいもです。

これはだいこんです。
This is Japanese radish / mooli.
kore wa daikon desu.
これは大根です。

これはぶどうです。
This is grape.
kore wa budou desu.
これはぶどうです。

これはなしです。
This is Japanese pear.
kore wa nashi desu.
これはなしです。

これはかきです。
This is persimmon.
kore wa kaki desu.
これはかきです。

これはあじです。
This is horse mackerel.
kore wa aji desu.
これはあじです。

これはいわしです。
This is sardine.
kore wa iwashi desu.
これはいわしです。

これはさばです。
This is mackerel.
kore wa saba desu.
これはさばです。

これはさんまです。
This is mackerel pike.
kore wa sanma desu.
これはさんまです。

これはたいです。
This is sea bream.
kore wa tai desu.
これはたいです。

これはたらです。
This is cod.
kore wa tara desu.
これはたらです。

これはえびです。
This is lobster / shrimp.
kore wa ebi desu.
これはえびです。

これはかにです。
This is crab.
kore wa kani desu.
これはかにです。

これはいかです。
This is cuttlefish / squid.
kore wa ika desu.
これはいかです。

これはこめです。
This is rice.
kore wa kome desu.
これはこめです。

これはかいです。
This is shellfish.
kore wa kai desu.
これはかいです。

これはなすです。
This is egg plant / aubergine.
kore wa nasu desu.
これはなすです。

これはまめです。
This is beans / peas.
kore wa mame desu.
これはまめです。

`;

allSentences["Sentence 06 - Hard"] = ``;

allSentences["Sentence 07"] = `
どうぞおあがりください。
Do come in.
douzo oagari kudasai
どうぞおあがりください。

ごめんください。
Anybody home?, May I come in?
gomenkudasai
ごめんください。

いらっしゃい。
How nice of you to come. (lit. Welcome.)
irasshai
いらっしゃい。

〜はいかがですか。
Would you like to have ~?
~ wa ikaga desu ka
〜はいかがですか。

いただきます。
Thank you./I accept. (said before starting to eat or drink)
itadakimasu
いただきます。

〜すてきですね。
What a nice ~!
~ suteki desu ne
〜すてきですね。

かして ください。
Please lend (it to me).
kashite kudasai
かして ください。

ちちはごしゅじんです。
 is husband.
chichi wa goshujin desu.
ちちはご主人です。

ははははしです。
 is chopsticks.
haha wa hashi desu.
ははははしです。

おとうさんはパンチです。
 is punch.
otousan wa panchi desu.
おとうさんはパンチです。

おかあさんはかみです。
 is paper.
okaasan wa kami desu.
おかあさんはかみです。

かぞくははなです。
family is flower.
kazoku wa hana desu.
家族ははなです。

そぼはクリスマスです。
grandmother is Christmas.
sobo wa kurisumasu desu.
祖母はクリスマスです。

そふはスプーンです。
grandfather is spoon.
sofu wa supuun desu.
祖父はスプーンです。

そふぼはナイフです。
grandparents is knife.
sofubo wa naifu desu.
祖父母はナイフです。

りょうしんはフォークです。
parents is fork.
ryoushin wa fooku desu.
両親はフォークです。

あねはパソコンです。
elder sister is personal computer.
ane wa pasokon desu.
姉はパソコンです。

いもうとはシャツです。
younger sister is shirt.
imouto wa shatsu desu.
妹はシャツです。

おとうとはプレゼントです。
younger brother is present.
otouto wa purezento desu.
弟はプレゼントです。

きょうだいはおかねです。
brothers and sisters is money.
kyoudai wa okane desu.
兄弟はおかねです。

つまはきっぷです。
wife is ticket.
tsuma wa kippu desu.
妻はきっぷです。

おっとはスペインです。
husband is Spain.
otto wa supein desu.
夫はスペインです。

ふうふはホッチキスです。
husband and wife is stapler.
fuufu wa hocchikisu desu.
夫婦はホッチキスです。

むすめはにもつです。
daughter is luggage.
musume wa nimotsu desu.
娘はにもつです。

むすこははさみです。
son is scissors.
musuko wa hasami desu.
息子ははさみです。

こどもはけしゴムです。
children is eraser.
kodomo wa keshigomu desu.
子どもはけしゴムです。

おばあさんはこれからです。
grandmother is from now on.
obaasan wa korekara desu.
おばあさんはこれからです。

おじいさんはりょこうです。
grandfather is trip.
ojiisan wa ryokou desu.
おじいさんはりょこうです。

ごりょうしんはヨーロッパです。
parents is Europe.
goryoushin wa yooroppa desu.
ご両親はヨーロッパです。

おねえさんはファックスです。
elder sister is fax.
oneesan wa fakkusu desu.
お姉さんはファックスです。

おにいさんはワープロです。
elder brother is word processor.
oniisan wa waapuro desu.
お兄さんはワープロです。

いもうとさんはセロテープです。
younger sister is Sellotape.
imoutosan wa seroteepu desu.
妹さんはセロテープです。

おとうとさんはケータイです。
younger brother is mobile phone.
otoutosan wa keetai desu.
弟さんはケータイです。

ごきょうだいはねんがじょうです。
brothers and sisters is New Year's greeting card.
gokyoudai wa nengajou desu.
ご兄弟はねんがじょうです。

おくさんはメールです。
wife is e-mail.
okusan wa meeru desu.
奥さんはメールです。

ごふうふはあniです。
married couple is elder brother.
gofuufu wa ani desu.
ご夫婦は兄です。

むすめさんはむすこさんです。
daughter is son.
musumesan wa musukosan desu.
娘さんは息子さんです。

おこさんです。
children is here.
okosan desu.
お子さんです。

でんわをかけます。
make (a phone call)
(denwa o) kakemasu
でんわをかけます。

りょこうをします。
travel, make a trip
ryokou o shimasu
りょこうをします。

きります。
cut, slice
kirimasu
きります。

おくります。
send
okurimasu
おくります。

あげます。
give
agemasu
あげます。

もらいます。
receive.
moraimasu.
もらいます。

かします。
lend
kashimasu
かします。

かります。
borrow
karimasu
かります。

おしえます。
teach
oshiemasu
おしえます。

ならいます。
learn.
naraimasu.
ならいます。

しつれいします。
Excuse me. (lit. to be rude)
shitsurei shimasu
しつれいします。

まだ、これはてです。
This is hand.
mada, kore wa te desu.
まだ、これはてです。

もう。
already
mou
もう。

`;

allSentences["Sentence 07 - Hard"] = ``;

allSentences["Sentence 08"] = `
いいえ、けっこうです。
No thank you.
iie kekkoo desu.
いいえ、けっこうです。

おげんきですか。
How are you?
genki desu ka
おげんきですか。

またいらっしゃってください。
Please come again.
mata irasshatte kudasai
またいらっしゃってください。

〜もういっぱいいかがですか。
Won't you have another cup of ~?
~ mou ippai ikaga desu ka
〜もういっぱいいかがですか。

げんき（な）をしごとをします。
do one's job healthy.
genki na o shigoto o shimasu.
げんき（な）をしごとをします。

ちいさいをそろそろしつれいします。
It's almost time to leave now small.
chiisai o sorosoro shitsurei shimasu.
ちいさいをそろそろしつれいします。

これはむずかしいです。
This is difficult.
kore wa muzukashii desu.
これはむずかしいです。

これはたかいです。
This is expensive.
kore wa takai desu.
これはたかいです。

これはやすいです。
This is inexpensive.
kore wa yasui desu.
これはやすいです。

これはさくらです。
This is cherry blossom.
kore wa sakura desu.
これはさくらです。

これはが、です。
This is ~ but ~.
kore wa ga ~/ ~ nga desu.
これはが、です。

これはハンサム（な）です。
This is handsome.
kore wa hansamu na desu.
これはハンサム（な）です。

これはどれです。
This is which one.
kore wa dore desu.
これはどれです。

これはきれい（な）です。
This is beautiful.
kore wa kirei na desu.
これはきれい（な）です。

これはしずか（な）です。
This is quiet.
kore wa shizuka na desu.
これはしずか（な）です。

これはにぎやか（な）です。
This is lively.
kore wa nigiyaka na desu.
これはにぎやか（な）です。

これはすてき（な）です。
This is fine.
kore wa suteki na desu.
これはすてき（な）です。

これはおおきいです。
This is big.
kore wa ookii desu.
これはおおきいです。

これはあたらしいです。
This is new.
kore wa atarashii desu.
これはあたらしいです。

これはふるいです。
This is old.
kore wa furui desu.
これはふるいです。

これはおもしろいです。
This is interesting.
kore wa omoshiroi desu.
これはおもしろいです。

これはおいしいです。
This is delicious.
kore wa oishii desu.
これはおいしいです。

これはたのしいです。
This is enjoyable.
kore wa tanoshii desu.
これはたのしいです。

これはしろいです。
This is white.
kore wa shiroi desu.
これはしろいです。

これはくろいです。
This is black.
kore wa kuroi desu.
これはくろいです。

これはあかいです。
This is red.
kore wa akai desu.
これはあかいです。

これはあおいです。
This is blue.
kore wa aoi desu.
これはあおいです。

これはやまです。
This is mountain.
kore wa yama desu.
これはやまです。

これはまちです。
This is town.
kore wa machi desu.
これはまちです。

これはべんきょうです。
This is study.
kore wa benkyou desu.
これはべんきょうです。

これはどうです。
This is how.
kore wa dou desu.
これはどうです。

これはどんなです。
This is what kind of ~.
kore wa donna desu.
これはどんなです。

これはとてもです。
This is very.
kore wa totemo desu.
これはとてもです。

これはふじさんです。
This is Mt. Fuji.
kore wa fuji-san desu.
これはふじさんです。

これはところです。
This is place.
kore wa tokoro desu.
これはところです。

これはいそがしいです。
This is busy.
kore wa isogashii desu.
これはいそがしいです。

これはせいかつです。
This is life.
kore wa seikatsu desu.
これはせいかつです。

これはしんせつ（な）です。
This is helpful.
kore wa shinsetsu na desu.
これはしんせつ（な）です。

これはいい・よいです。
This is good.
kore wa ii / yoi desu.
これはいい・よいです。

これはあまりです。
This is not so.
kore wa amari desu.
これはあまりです。

これはそしてです。
This is and.
kore wa soshite desu.
これはそしてです。

これはやさしいです。
This is easy.
kore wa yasashii desu.
これはやさしいです。

これはゆうめい（な）です。
This is famous.
kore wa yuumei na desu.
これはゆうめい（な）です。

これはひま（な）です。
This is free.
kore wa hima na desu.
これはひま（な）です。

これはべんり（な）です。
This is convenient.
kore wa benri na desu.
これはべんり（な）です。

これはさむいです。
This is cold.
kore wa samui desu.
これはさむいです。

これはつめたいです。
This is cold.
kore wa tsumetai desu.
これはつめたいです。

これはひくいです。
This is low.
kore wa hikui desu.
これはひくいです。

これはくるまです。
This is car.
kore wa kuruma desu.
これはくるまです。

これはりょうです。
This is dormitory.
kore wa ryou desu.
これはりょうです。

これは（お）しごとです。
This is work.
kore wa (o)shigoto desu.
これは（お）しごとです。

これはそうですねです。
This is Well let me see...
kore wa sou desu ne desu.
これはそうですねです。

これはにほんのせいかつになれましたかです。
This is Have you got used to the life in Japan?.
kore wa nihon no seikatsu ni naremashita ka desu.
これはにほんのせいかつになれましたかです。

これはもうですねです。
This is It's already ~ isn't it?.
kore wa mou ~ desu ne desu.
これはもうですねです。

これはびわこです。
This is Lake Biwa.
kore wa biwa-ko desu.
これはびわこです。

これはシャンハイです。
This is Shanghai.
kore wa shanhai desu.
これはシャンハイです。

これはしちにんのさむらいです。
This is The Seven Samurai.
kore wa shichi-nin no samurai desu.
これはしちにんのさむらいです。

これはきんかくじです。
This is Kinkakuji Temple.
kore wa kinkakuji desu.
これはきんかくじです。

これはわるいです。
This is bad.
kore wa warui desu.
これはわるいです。

これはあついです。
This is hot.
kore wa atsui desu.
これはあついです。

これはたべものです。
This is food.
kore wa tabemono desu.
これはたべものです。

これはしろです。
This is white.
kore wa Shiro desu.
これは白です。

これはくろです。
This is black.
kore wa Kuro desu.
これは黒です。

これはあかです。
This is red.
kore wa Aka desu.
これは赤です。

これはあおです。
This is blue.
kore wa Ao desu.
これは青です。

これはみどりです。
This is green.
kore wa Midori desu.
これは緑です。

これはむらさきです。
This is purple.
kore wa Murasaki desu.
これは紫です。

これはピンクです。
This is pink.
kore wa Pinku desu.
これはピンクです。

これはオレンジです。
This is orange.
kore wa Orenji desu.
これはオレンジです。

これはグレーです。
This is gray.
kore wa Guree desu.
これはグレーです。

これはベージュです。
This is beige.
kore wa Beeju desu.
これはベージュです。

これはきいろいです。
This is yellow.
kore wa Kiiroi desu.
これは黄色いです。

これはちゃいろいです。
This is brown.
kore wa Chairoi desu.
これは茶色いです。

これはあまいです。
This is sweet.
kore wa Amai desu.
これは甘いです。

これはからいです。
This is hot.
kore wa Karai desu.
これは辛いです。

これはきいろです。
This is yellow.
kore wa Kiiro desu.
これは黄色です。

これはちゃいろです。
This is brown.
kore wa Chairo desu.
これは茶色です。

これはにがいです。
This is bitter.
kore wa Nigai desu.
これは苦いです。

これはしおからいです。
This is salty.
kore wa Shiokarai desu.
これは塩辛いです。

これはすっぱいです。
This is sour.
kore wa Suppai desu.
これは酸っぱいです。

これはこいです。
This is strong.
kore wa Koi desu.
これは濃いです。

これはうすいです。
This is weak.
kore wa Usui desu.
これは薄いです。

`;

allSentences["Sentence 08 - Hard"] = ``;

allSentences["Sentence 09"] = `
いっしょにいかがですか。
Won't you join me (us)?
isshoni ikaga desu ka
いっしょにいかがですか。

だめですか。
So you cannot (come)?
dame desu ka
だめですか。

またこんどおねがいします。
Please ask me again some other time. (used when refusing an invitation indirectly, considering someone's feelings)
mata kondo onegaishimasu
またこんどおねがいします。

こどもはごしゅじんです。
child is someone else's husband.
kodomo wa goshujin desu.
こどもはごしゅじんです。

おくさんはおっと・しゅじんです。
 is .
okusan wa otto / shujin desu.
おくさんはおっと・しゅじんです。

わかります。
understand.
wakarimasu.
わかります。

あります。
have.
arimasu.
あります。

すき（な）をスポーツをします。
play sports like.
suki na o supootsu o shimasu.
すき（な）をスポーツをします。

きらい（な）をやきゅうをします。
play baseball dislike.
kirai na o yakyuu o shimasu.
きらい（な）をやきゅうをします。

のみものをダンスをします。
to dance drinks.
nomimono o dansu o shimasu.
のみものをダンスをします。

これはだいたいです。
This is mostly.
kore wa daitai desu.
これはだいたいです。

これはえです。
This is picture.
kore wa e desu.
これはえです。

これはじです。
This is letter.
kore wa ji desu.
これはじです。

これはじかんです。
This is time.
kore wa jikan desu.
これはじかんです。

これはやくそくです。
This is appointment.
kore wa yakusoku desu.
これはやくそくです。

これはたくさんです。
This is many.
kore wa takusan desu.
これはたくさんです。

これはすこしです。
This is a little.
kore wa sukoshi desu.
これはすこしです。

これはぜんぜんです。
This is not at all.
kore wa zenzen desu.
これはぜんぜんです。

これはもしもしです。
This is hello.
kore wa moshimoshi desu.
これはもしもしです。

これはああです。
This is oh.
kore wa aa desu.
これはああです。

これははやくです。
This is early.
kore wa hayaku desu.
これははやくです。

これはスポーツです。
This is sport.
kore wa supootsu desu.
これはスポーツです。

これはダンスです。
This is dance.
kore wa dansu desu.
これはダンスです。

これはおんがくです。
This is music.
kore wa ongaku desu.
これはおんがくです。

これはクラシックです。
This is classical music.
kore wa kurashikku desu.
これはクラシックです。

これはジャズです。
This is jazz.
kore wa jazu desu.
これはジャズです。

これはコンサートです。
This is concert.
kore wa konsaato desu.
これはコンサートです。

これはカラオケです。
This is karaoke.
kore wa karaoke desu.
これはカラオケです。

これはかんじです。
This is Chinese characters.
kore wa kanji desu.
これはかんじです。

これはひらがなです。
This is hiragana script.
kore wa hiragana desu.
これはひらがなです。

これはカタカナです。
This is katakana script.
kore wa katakana desu.
これはカタカナです。

これはローマじです。
This is Roman alphabet.
kore wa roomaji desu.
これはローマじです。

これはチケットです。
This is ticket.
kore wa chiketto desu.
これはチケットです。

これはかぶきです。
This is Traditional Japanese musical drama.
kore wa kabuki desu.
これはかぶきです。

これはこまかいおかねです。
This is small change.
kore wa komakai okane desu.
これはこまかいおかねです。

これはざんねんですねです。
This is I'm sorry.
kore wa zannen desu ne desu.
これはざんねんですねです。

これはじょうず（な）です。
This is good at.
kore wa jouzu na desu.
これはじょうず（な）です。

これはへた（な）です。
This is poor at.
kore wa heta na desu.
これはへた（な）です。

これはようじです。
This is something to do.
kore wa youji desu.
これはようじです。

これはつま・かないです。
This is .
kore wa tsuma / kanai desu.
これはつま・かないです。

これはりょうりです。
This is dish.
kore wa ryouri desu.
これはりょうりです。

これはよくです。
This is well.
kore wa yoku desu.
これはよくです。

これははちょっと…です。
This is ~ is a bit difficult..
kore wa wa chotto... desu.
これははちょっと…です。

これはからです。
This is because ~.
kore wa kara desu.
これはからです。

これはどうしてです。
This is why.
kore wa doushite desu.
これはどうしてです。

これはすみませんです。
This is I am sorry.
kore wa sumimasen desu.
これはすみませんです。

これはやきゅうです。
This is baseball.
kore wa yakyuu desu.
これはやきゅうです。

これはうたです。
This is song.
kore wa uta desu.
これはうたです。

これはエスエフです。
This is science fiction.
kore wa Esuefu desu.
これはSFです。

これはせんそうです。
This is war.
kore wa Sensou desu.
これは戦争です。

これはラテンです。
This is Latin-American.
kore wa Raten desu.
これはラテンです。

これはけんどうです。
This is Japanese fencing.
kore wa Kendou desu.
これは剣道です。

これはミュージカルです。
This is musical.
kore wa Myuujikaru desu.
これはミュージカルです。

これはドキュメンタリーです。
This is documentary.
kore wa Dokyumentarii desu.
これはドキュメンタリーです。

これはれんあいです。
This is romance.
kore wa Ren'ai desu.
これは恋愛です。

これはポップスです。
This is pop.
kore wa Poppusu desu.
これはポップスです。

これはロックです。
This is rock.
kore wa Rokku desu.
これはロックです。

これはオペラです。
This is opera.
kore wa Opera desu.
これはオペラです。

これはホラーです。
This is horror.
kore wa Horaa desu.
これはホラーです。

これはアニメです。
This is cartoon.
kore wa Anime desu.
これはアニメです。

これはミステリーです。
This is mystery.
kore wa Misuterii desu.
これはミステリーです。

これはアクションです。
This is action.
kore wa Akushon desu.
これはアクションです。

これはソフトボールです。
This is softball.
kore wa Sofutobooru desu.
これはソフトボールです。

これはサッカーです。
This is soccer.
kore wa Sakkaa desu.
これはサッカーです。

これはラグビーです。
This is rugby.
kore wa Ragubii desu.
これはラグビーです。

これはすもうです。
This is sumo.
kore wa Sumou desu.
これは相撲です。

これはバレーボールです。
This is volleyball.
kore wa Bareebooru desu.
これはバレーボールです。

これはじゅうどうです。
This is judo.
kore wa Juudou desu.
これは柔道です。

これはバスケットボールです。
This is basketball.
kore wa Basukettobooru desu.
これはバスケットボールです。

これはテニスです。
This is tennis.
kore wa Tenisu desu.
これはテニスです。

これはボウリングです。
This is bowling.
kore wa Bouringu desu.
これはBouringuです。

これはスキーです。
This is skiing.
kore wa Sukii desu.
これはスキーです。

これはスケートです。
This is skating.
kore wa Sukeeto desu.
これはスケートです。

これはピンポンです。
This is ping-pong.
kore wa Pinpon desu.
これはピンポンです。

これはみんようです。
This is folk.
kore wa Minyou desu.
これは民謡です。

これはぶんげいです。
This is film based on a classic work.
kore wa Bungei desu.
これは文芸です。

これはきげきです。
This is comedy.
kore wa Kigeki desu.
これは喜劇です。

これはたっきゅうです。
This is table tennis.
kore wa Takkyuu desu.
これは卓球です。

これはすいえいです。
This is swimming.
kore wa Suiei desu.
これは水泳です。

これはえんかです。
This is traditional Japanese popular songs.
kore wa Enka desu.
これは演歌です。

`;

allSentences["Sentence 09 - Hard"] = ``;

allSentences["Sentence 10"] = `
います。
exist.
imasu.
います。

あります。
exist.
arimasu.
あります。

これはいろいろ（な）です。
This is various.
kore wa iroiro na desu.
これはいろいろ（な）です。

これはきです。
This is tree.
kore wa ki desu.
これはきです。

これははこです。
This is box.
kore wa hako desu.
これははこです。

これはまどです。
This is window.
kore wa mado desu.
これはまどです。

これはなかです。
This is in.
kore wa naka desu.
これはなかです。

これはとなりです。
This is next.
kore wa tonari desu.
これはとなりです。

これはいちばんです。
This is the number one.
kore wa ichiban desu.
これはいちばんです。

これはおとこのひとです。
This is man.
kore wa otoko no hito desu.
これはおとこのひとです。

これはおんなのひとです。
This is woman.
kore wa onna no hito desu.
これはおんなのひとです。

これはおとこのこです。
This is boy.
kore wa otoko no ko desu.
これはおとこのこです。

これはおんなのこです。
This is girl.
kore wa onna no ko desu.
これはおんなのこです。

これはいぬです。
This is dog.
kore wa inu desu.
これはいぬです。

これはねこです。
This is cat.
kore wa neko desu.
これはねこです。

これはフィルムです。
This is film.
kore wa firumu desu.
これはフィルムです。

これはスイッチです。
This is switch.
kore wa suicchi desu.
これはスイッチです。

これはテーブルです。
This is table.
kore wa teeburu desu.
これはテーブルです。

これはベッドです。
This is bed.
kore wa beddo desu.
これはベッドです。

これはドアです。
This is door.
kore wa doa desu.
これはドアです。

これはこうえんです。
This is park.
kore wa kouen desu.
これはこうえんです。

これはやです。
This is ~store.
kore wa ya desu.
これはやです。

これはスパイスコーナーです。
This is spice corner.
kore wa supaisu koonaa desu.
これはスパイスコーナーです。

これはチリソースです。
This is chili sauce.
kore wa chiri soosu desu.
これはチリソースです。

これはとうきょうディズニーランドです。
This is Tokyo Disneyland.
kore wa toukyou dizuniirando desu.
これはとうきょうディズニーランドです。

これはでんちです。
This is battery.
kore wa denchi desu.
これはでんちです。

これはれいぞうこです。
This is refrigerator.
kore wa reizouko desu.
これはれいぞうこです。

これはきっさてんです。
This is coffee shop.
kore wa kissaten desu.
これはきっさてんです。

これはのりばです。
This is a fixed place to catch taxis.
kore wa noriba desu.
これはのりばです。

これはちかくです。
This is near.
kore wa chikaku desu.
これはちかくです。

これはあいだです。
This is between.
kore wa aida desu.
これはあいだです。

これはだんめです。
This is the nth shelf.
kore wa danme desu.
これはだんめです。

これはたなです。
This is shelf.
kore wa tana desu.
これはたなです。

これはほんやです。
This is bookstore.
kore wa honya desu.
これはほんやです。

これはうえです。
This is on.
kore wa ue desu.
これはうえです。

これはしたです。
This is under.
kore wa shita desu.
これはしたです。

これはまえです。
This is front.
kore wa mae desu.
これはまえです。

これはうしろです。
This is back.
kore wa ushiro desu.
これはうしろです。

これはみぎです。
This is right.
kore wa migi desu.
これはみぎです。

これはひだりです。
This is left.
kore wa hidari desu.
これはひだりです。

これはおくです。
This is the back.
kore wa oku desu.
これはおくです。

これはそとです。
This is outside.
kore wa soto desu.
これはそとです。

これはビルです。
This is building.
kore wa biru desu.
これはビルです。

これはけんです。
This is prefecture.
kore wa ken desu.
これはけんです。

これはどうもすみませんです。
This is Thank you.
kore wa doumo sumimasen desu.
これはどうもすみませんです。

これはポストです。
This is mailbox.
kore wa posuto desu.
これはポストです。

これはものです。
This is thing.
kore wa mono desu.
これはものです。

これはパンダです。
This is panda.
kore wa panda desu.
これはパンダです。

これはぞうです。
This is elephant.
kore wa zou desu.
これはぞうです。

これはATMです。
This is cash machine.
kore wa ee-tii-emu desu.
これはATMです。

これはコンビニです。
This is convenience store.
kore wa konbini desu.
これはコンビニです。

これはうちのなかです。
This is Inside the house.
kore wa uchi no naka desu.
これはうちの中です。

これはげんかんです。
This is entrance hall.
kore wa Genkan desu.
これは玄関です。

これはふろばです。
This is bathroom.
kore wa Furoba desu.
これはふろ場です。

これはせんめんじょです。
This is washroom.
kore wa Senmenjo desu.
これは洗面所です。

これはだいどころです。
This is kitchen.
kore wa Daidokoro desu.
これは台所です。

これはしょくどうです。
This is dining room.
kore wa Shokudou desu.
これは食堂です。

これはいまです。
This is living room.
kore wa Ima desu.
これは居間です。

これはしんしつです。
This is bedroom.
kore wa Shinshitsu desu.
これは寝室です。

これはろうかです。
This is hall.
kore wa Rouka desu.
これは廊下です。

これはベランダです。
This is balcony.
kore wa Beranda desu.
これはベランダです。

これはトイレです。
This is toilet.
kore wa Toire desu.
これはトイレです。

`;

allSentences["Sentence 10 - Hard"] = ``;

allSentences["Sentence 11"] = `
いってらっしゃい。
See you later./So long. (lit. Go and come back.)
itterasshai
いってらっしゃい。

いって きます。
See you later./So long. (lit. I'm going and coming back.)
itte kimasu
いって きます。

いってまいります。
I'm off, see you later. (lit. I'm going and coming back)
itte mairimasu
いってまいります。

いらっしゃいませ。
Welcome. / May I help you? (greeting a customer or a guest entering a shop)
irasshaimase
いらっしゃいませ。

いいてんきですね。
Nice weather isn't it?
ii tenki desu ne
いいてんきですね。

おでかけですか。
Are you going out?
odekake desu ka
おでかけですか。

これはりんごです。
This is apple.
kore wa ringo desu.
これはりんごです。

たなかさんです。
This is Tanaka-san.
tanaka san desu.
たなかさんです。

みんなはすしです。
all is vinegared rice with raw fish.
minna wa Sushi desu.
みんなはすしです。

きょうだいはオーストラリアです。
brothers and sisters is Australia.
kyoudai wa oosutoraria desu.
きょうだいはオーストラリアです。

あにはみかんです。
 is mandarin orange.
ani wa mikan desu.
あにはみかんです。

おにいさんはカレーです。
 is curry.
oniisan wa karee desu.
おにいさんはカレーです。

あねはぜんぶでです。
 is in total.
ane wa zenbude desu.
あねはぜんぶでです。

おねえさんはサンドイッチです。
 is sandwich.
oneesan wa sandoicchi desu.
おねえさんはサンドイッチです。

おとうとはアイスクリームです。
 is ice cream.
otouto wa aisukuriimu desu.
おとうとはアイスクリームです。

おとうとさんはいもうとです。
 is .
otoutosan wa imouto desu.
おとうとさんはいもうとです。

いもうとさんはいちです。
 is one.
imoutosan wa ichi desu.
いもうとさんはいちです。

にほんごです。
This uses the language suffix -go (nihon-go).
nihon go desu.
にほんごです。

（こどもが）います。
have.
(kodomo ga) imasu.
（こどもが）います。

（にほん）にいます。
stay.
(nihon) ni imasu.
（にほん）にいます。

（かいしゃを）やすみます。
take a day off.
(kaisha o) yasumimasu.
（かいしゃを）やすみます。

かかります。
take.
kakarimasu.
かかります。

これはにです。
This is two.
kore wa ni desu.
これはにです。

これはよんです。
This is four.
kore wa yon, shi desu.
これはよんです。

これはろくです。
This is six.
kore wa roku desu.
これはろくです。

これはななです。
This is seven.
kore wa nana, shichi desu.
これはななです。

これははちです。
This is eight.
kore wa hachi desu.
これははちです。

これはきゅうです。
This is nine.
kore wa kyuu, ku desu.
これはきゅうです。

これはじゅうです。
This is ten.
kore wa juu desu.
これはじゅうです。

これはひとりです。
This is one person.
kore wa hitori desu.
これはひとりです。

これはふたりです。
This is two people.
kore wa futari desu.
これはふたりです。

これはさんにんです。
This is three people.
kore wa sannin desu.
これはさんにんです。

これはよにんです。
This is four people.
kore wa yonin desu.
これはよにんです。

これはごにんです。
This is five people.
kore wa gonin desu.
これはごにんです。

これはろくにんです。
This is six people.
kore wa rokunin desu.
これはろくにんです。

これはななにん/しちにんです。
This is seven people.
kore wa nananin, shichinin desu.
これはななにん/しちにんです。

これははちにんです。
This is eight people.
kore wa hachinin desu.
これははちにんです。

これはきゅうにん/くにんです。
This is nine people.
kore wa kyuunin desu.
これはきゅうにん/くにんです。

これはじゅうにんです。
This is ten people.
kore wa juunin desu.
これはじゅうにんです。

これはいちだいです。
This is one machine / vehicle.
kore wa ichidai desu.
これはいちだいです。

これはにだいです。
This is two machines / vehicles.
kore wa nidai desu.
これはにだいです。

これはさんだいです。
This is three machines / vehicles.
kore wa sandai desu.
これはさんだいです。

これはよんだいです。
This is four machines / vehicles.
kore wa yondai desu.
これはよんだいです。

これはごだいです。
This is five machines / vehicles.
kore wa godai desu.
これはごだいです。

これはろくだいです。
This is six machines / vehicles.
kore wa rokudai desu.
これはろくだいです。

これはななだいです。
This is seven machines / vehicles.
kore wa nanadai desu.
これはななだいです。

これははちだいです。
This is eight machines / vehicles.
kore wa hachidai desu.
これははちだいです。

これはきゅうだいです。
This is nine machines / vehicles.
kore wa kyuudai desu.
これはきゅうだいです。

これはじゅうだいです。
This is ten machines / vehicles.
kore wa juudai desu.
これはじゅうだいです。

これはいちまいです。
This is one flat object / sheet.
kore wa ichimai desu.
これはいちまいです。

これはにまいです。
This is two flat objects / sheets.
kore wa nimai desu.
これはにまいです。

これはさんまいです。
This is three flat objects / sheets.
kore wa sanmai desu.
これはさんまいです。

これはよんまいです。
This is four flat objects / sheets.
kore wa yonmai desu.
これはよんまいです。

これはごまいです。
This is five flat objects / sheets.
kore wa gomai desu.
これはごまいです。

これはろくまいです。
This is six flat objects / sheets.
kore wa rokumai desu.
これはろくまいです。

これはななまいです。
This is seven flat objects / sheets.
kore wa nanamai desu.
これはななまいです。

これははちまいです。
This is eight flat objects / sheets.
kore wa hachimai desu.
これははちまいです。

これはきゅうまいです。
This is nine flat objects / sheets.
kore wa kyuumai desu.
これはきゅうまいです。

これはじゅうまいです。
This is ten flat objects / sheets.
kore wa juumai desu.
これはじゅうまいです。

これはいっかいです。
This is once / one time.
kore wa ikkai desu.
これはいっかいです。

これはにかいです。
This is twice / two times.
kore wa nikai desu.
これはにかいです。

これはさんかいです。
This is three times.
kore wa sankai desu.
これはさんかいです。

これはよんかいです。
This is four times.
kore wa yonkai desu.
これはよんかいです。

これはごかいです。
This is five times.
kore wa gokai desu.
これはごかいです。

これはろっかいです。
This is six times.
kore wa rokkai desu.
これはろっかいです。

これはなにかい/しちかいです。
This is seven times.
kore wa nanakai desu.
これはなにかい/しちかいです。

これははっかい/はちかいです。
This is eight times.
kore wa hakkai desu.
これははっかい/はちかいです。

これはきゅうかいです。
This is nine times.
kore wa kyuukai desu.
これはきゅうかいです。

これはじゅっかいです。
This is ten times.
kore wa jukkai desu.
これはじゅっかいです。

これはいちじかんです。
This is one hour.
kore wa ichijikan desu.
これはいちじかんです。

これはにじかんです。
This is two hours.
kore wa nijikan desu.
これはにじかんです。

これはさんじかんです。
This is three hours.
kore wa sanjikan desu.
これはさんじかんです。

これはよじかんです。
This is four hours.
kore wa yojikan desu.
これはよじかんです。

これはごじかんです。
This is five hours.
kore wa gojikan desu.
これはごじかんです。

これはろくじかんです。
This is six hours.
kore wa rokujikan desu.
これはろくじかんです。

これはしちじかん/ななじかんです。
This is seven hours.
kore wa shichijikan / nanajikan desu.
これはしちじかん/ななじかんです。

これははちじかんです。
This is eight hours.
kore wa hachijikan desu.
これははちじかんです。

これはくじかん/きゅうじかんです。
This is nine hours.
kore wa kujikan desu.
これはくじかん/きゅうじかんです。

これはじゅうじかんです。
This is ten hours.
kore wa juujikan desu.
これはじゅうじかんです。

これはきってです。
This is postage stamp.
kore wa kitte desu.
これはきってです。

これははがきです。
This is post card.
kore wa hagaki desu.
これははがきです。

これはふうとうです。
This is envelope.
kore wa fuutou desu.
これはふうとうです。

これはそくたつです。
This is special delivery.
kore wa sokutatsu desu.
これはそくたつです。

これはかきとめです。
This is registered mail.
kore wa kakitome desu.
これはかきとめです。

これはエアメール・こうくうびんです。
This is airmail.
kore wa eameeru desu.
これはエアメール・こうくうびんです。

これはふなびんです。
This is sea mail.
kore wa funabin desu.
これはふなびんです。

これはがいこくです。
This is foreign country.
kore wa gaikoku desu.
これはがいこくです。

これはだけです。
This is only ~.
kore wa dake desu.
これはだけです。

これはだいです。
This is counter for machines cars etc.
kore wa dai desu.
これはだいです。

これはまいです。
This is counter for thin and flat objects such as paper stamps etc.
kore wa mai desu.
これはまいです。

これはかいです。
This is counter for frequency.
kore wa kai desu.
これはかいです。

これはじかんです。
This is .
kore wa jikan desu.
これはじかんです。

これはしゅうかんです。
This is .
kore wa shuukan desu.
これはしゅうかんです。

これはかげつです。
This is .
kore wa kagetsu desu.
これはかげつです。

これはねんです。
This is .
kore wa nen desu.
これはねんです。

これはぐらいです。
This is about.
kore wa gurai desu.
これはぐらいです。

これはどのぐらいです。
This is how long.
kore wa donokurai desu.
これはどのぐらいです。

これはちょっとまでです。
This is I'm just going to ~ for a short while.
kore wa chotto ~ made desu.
これはちょっとまでです。

これはそれからです。
This is and then.
kore wa sorekara desu.
これはそれからです。

これはひとつです。
This is one.
kore wa hitotsu desu.
これはひとつです。

これはふたつです。
This is two.
kore wa futatsu desu.
これはふたつです。

これはみっつです。
This is three.
kore wa mittsu desu.
これはみっつです。

これはよっつです。
This is four.
kore wa yottsu desu.
これはよっつです。

これはいつつです。
This is five.
kore wa itsutsu desu.
これはいつつです。

これはむっつです。
This is six.
kore wa muttsu desu.
これはむっつです。

これはななつです。
This is seven.
kore wa nanatsu desu.
これはななつです。

これはやっつです。
This is eight.
kore wa yattsu desu.
これはやっつです。

これはここのつです。
This is nine.
kore wa kokonotsu desu.
これはここのつです。

これはとおです。
This is ten.
kore wa too desu.
これはとおです。

これはいくつです。
This is how many.
kore wa ikutsu desu.
これはいくつです。

これはにんです。
This is ~ people.
kore wa nin desu.
これはにんです。

これはなんねんです。
This is what year.
kore wa nannen desu.
これはなんねんです。

これはナンプラーです。
This is nam pla.
kore wa nanpuraa desu.
これはナンプラーです。

これはコーナーです。
This is corner.
kore wa koonaa desu.
これはコーナーです。

これはいちばんしたです。
This is the bottom.
kore wa ichiban shita desu.
これはいちばんしたです。

これはやきにくです。
This is grilled meat.
kore wa Yakiniku desu.
これは焼き肉です。

これはハンバーグです。
This is hamburg steak.
kore wa Hanbaagu desu.
これはハンバーグです。

これはハンバーガーです。
This is hamburger.
kore wa Hanbaagaa desu.
これはハンバーガーです。

これはコロッケです。
This is croquette.
kore wa Korokke desu.
これはコロッケです。

これはえびフライです。
This is fried shrimp.
kore wa Ebi furai desu.
これはえびフライです。

これはスパゲッティです。
This is spaghetti.
kore wa Supagettii desu.
これはスパゲッティです。

これはランチです。
This is western-style set meal.
kore wa Ranchi desu.
これはランチです。

これはカレーライスです。
This is curry with rice.
kore wa Kareeraisu desu.
これはカレーライスです。

これはみそしるです。
This is miso soup.
kore wa Misoshiru desu.
これはみそ汁です。

これはうどんです。
This is Japanese noodles made from wheat flour.
kore wa Udon desu.
これはうどんです。

これはそばです。
This is Japanese noodles made from buckwheat flour.
kore wa Soba desu.
これはそばです。

これはラーメンです。
This is Chinese noodles in soup with meat and vegetables.
kore wa Raamen desu.
これはラーメンです。

これはフライドチキンです。
This is fried chicken.
kore wa Furaido chikin desu.
これはフライドチキンです。

これはサラダです。
This is salad.
kore wa Sarada desu.
これはサラダです。

これはスープです。
This is soup.
kore wa Suupu desu.
これはスープです。

これはピザです。
This is pizza.
kore wa Piza desu.
これはピザです。

これはトーストです。
This is toast.
kore wa Toosuto desu.
これはトーストです。

これはコーヒーです。
This is coffee.
kore wa Koohii desu.
これはコーヒーです。

これはこうちゃです。
This is black tea.
kore wa Koucha desu.
これは紅茶です。

これはココアです。
This is cocoa.
kore wa Kokoa desu.
これはココアです。

これはジュースです。
This is juice.
kore wa Juusu desu.
これはジュースです。

これはコーラです。
This is cola.
kore wa Koora desu.
これはコーラです。

これはていしょくです。
This is set meal.
kore wa Teishoku desu.
これは定食です。

これはぎゅうどんです。
This is a bowl of rice with beef.
kore wa Gyudon desu.
これは牛どんです。

これはおにぎりです。
This is rice ball.
kore wa Onigiri desu.
これはおにぎりです。

これはてんぷらです。
This is fried seafood and vegetables.
kore wa Tenpura desu.
これはてんぷらです。

これはてんどんです。
This is a bowl of rice with fried seafood and vegetables.
kore wa Tendon desu.
これは天どんです。

これはおやこどんです。
This is a bowl of rice with chicken and egg.
kore wa Oyakodon desu.
これは親子どんです。

これはやさいいためです。
This is sautéed vegetables.
kore wa Yasai itame desu.
これは野菜いためです。

これはつけものです。
This is pickles.
kore wa Tsukemono desu.
これは漬物です。

これはやきそばです。
This is Chinese stir-fried noodles with pork and vegetables.
kore wa Yakisoba desu.
これは焼きそばです。

これはおこのみやきです。
This is a type of pancake grilled with meat.
kore wa Okonomiyaki desu.
これはお好み焼きです。

`;

allSentences["Sentence 11 - Hard"] = ``;

allSentences["Sentence 12"] = `
かんたん（な）はどちらです。
easy is which one.
kantan na wa dochira desu.
かんたん（な）はどちらです。

これはとおいです。
This is far.
kore wa tooi desu.
これはとおいです。

これははやいです。
This is fast.
kore wa hayai desu.
これははやいです。

これはあたたかいです。
This is warm.
kore wa atatakai desu.
これはあたたかいです。

これはあまいです。
This is sweet.
kore wa amai desu.
これはあまいです。

これははるです。
This is spring.
kore wa haru desu.
これははるです。

これはなつです。
This is summer.
kore wa natsu desu.
これはなつです。

これはあきです。
This is autumn.
kore wa aki desu.
これはあきです。

これはあめです。
This is rain.
kore wa ame desu.
これはあめです。

これはゆきです。
This is snow.
kore wa yuki desu.
これはゆきです。

これはうみです。
This is sea.
kore wa umi desu.
これはうみです。

これはせかいです。
This is world.
kore wa sekai desu.
これはせかいです。

これははじめてです。
This is for the first time.
kore wa hajimete desu.
これははじめてです。

これはただいまです。
This is I'm home.
kore wa tadaima desu.
これはただいまです。

これはすごいですねです。
This is That's amazing.
kore wa sugoi desu ne desu.
これはすごいですねです。

これは（コーヒーが）いいです。
This is prefer.
kore wa (koohii ga) ii desu.
これは（コーヒーが）いいです。

これはホテルです。
This is hotel.
kore wa hoteru desu.
これはホテルです。

これはパーティーです。
This is party.
kore wa paatii desu.
これはパーティーです。

これはホンコンです。
This is Hong Kong.
kore wa honkon desu.
これはホンコンです。

これはシンガポールです。
This is Singapore.
kore wa shingapooru desu.
これはシンガポールです。

これはクラスです。
This is class.
kore wa kurasu desu.
これはクラスです。

これはすずしいです。
This is cool.
kore wa suzushii desu.
これはすずしいです。

これは（ひとが）おおいです。
This is many.
kore wa (hito ga) ooi desu.
これは（ひとが）おおいです。

これは（ひとが）すくないです。
This is few.
kore wa (hito ga) sukunai desu.
これは（ひとが）すくないです。

これはきせつです。
This is season.
kore wa kisetsu desu.
これはきせつです。

これはくもりです。
This is cloudy.
kore wa kumori desu.
これはくもりです。

これはしけんです。
This is examination.
kore wa shiken desu.
これはしけんです。

これはすきやきです。
This is beef and vegetable hot pot.
kore wa sukiyaki desu.
これはすきやきです。

これはさしみです。
This is sliced raw fish.
kore wa sashimi desu.
これはさしみです。

これはすしです。
This is rice with vinegar topped with raw fish.
kore wa sushi desu.
これはすしです。

これはてんぷらです。
This is seafood and vegetables deep fried in batter.
kore wa tempura desu.
これはてんぷらです。

これはいけばなです。
This is flower arrangement.
kore wa ikebana desu.
これはいけばなです。

これはもみじです。
This is maple.
kore wa momiji desu.
これはもみじです。

これはちかいです。
This is near.
kore wa chikai desu.
これはちかいです。

これはおそいです。
This is slow.
kore wa osoi desu.
これはおそいです。

これはからいです。
This is hot.
kore wa karai desu.
これはからいです。

これはおもいです。
This is heavy.
kore wa omoi desu.
これはおもいです。

これはかるいです。
This is light.
kore wa karui desu.
これはかるいです。

これはふゆです。
This is winter.
kore wa fuyu desu.
これはふゆです。

これはてんきです。
This is weather.
kore wa tenki desu.
これはてんきです。

これはくうこうです。
This is airport.
kore wa kuukou desu.
これはくうこうです。

これはまつりです。
This is festival.
kore wa matsuri desu.
これはまつりです。

これはどちらもです。
This is both.
kore wa dochiramo desu.
これはどちらもです。

これはずっとです。
This is by far.
kore wa zutto desu.
これはずっとです。

これはおかえりなさいです。
This is Welcome home.
kore wa okaerinasai desu.
これはおかえりなさいです。

これはでもです。
This is but.
kore wa demo desu.
これはでもです。

これはつかれましたです。
This is I'm tired.
kore wa tsukaremashita desu.
これはつかれましたです。

これはぶたにくです。
This is pork.
kore wa butaniku desu.
これはぶたにくです。

これはレモンです。
This is lemon.
kore wa remon desu.
これはレモンです。

これはわあ、すごいひとですねです。
This is Wow! Look at all those people!.
kore wa waa, sugoi hito desu ne desu.
これはわあ、すごいひとですねです。

これはろくおんじ（きんかくじ）きんかくです。
This is Rokuon-ji Temple.
kore wa Rokuonji (Kinkakuji) desu.
これは鹿苑寺（金閣寺）です。

これはひろしまです。
This is Hiroshima.
kore wa Hiroshima desu.
これは広島です。

これはひめじです。
This is Himeji.
kore wa Himeji desu.
これは姫路です。

これはおおさかです。
This is Osaka.
kore wa Oosaka desu.
これは大阪です。

これはならです。
This is Nara.
kore wa Nara desu.
これは奈良です。

これはきょうとです。
This is Kyoto.
kore wa Kyouto desu.
これは京都です。

これはとうきょうです。
This is Tokyo.
kore wa Toukyou desu.
これは東京です。

これはにっこうです。
This is Nikko.
kore wa Nikkou desu.
これは日光です。

これはひめじじょうです。
This is Himeji Castle.
kore wa Himejijou desu.
これは姫路城です。

これはふじさんです。
This is Mt. Fuji.
kore wa Fujisan desu.
これは富士山です。

これはかんだまつりです。
This is Kanda Festival.
kore wa Kanda Matsuri desu.
これは神田祭です。

これはてんじんまつりです。
This is Tenjin Festival.
kore wa Tenjin Matsuri desu.
これは天神祭です。

これはぎおんまつりです。
This is Gion Festival.
kore wa Gion Matsuri desu.
これは祇園祭です。

これはとうだいじです。
This is Todai-ji Temple.
kore wa Toudaiji desu.
これは東大寺です。

これはこうきょです。
This is Imperial Palace.
kore wa Koukyo desu.
これは皇居です。

これはまつりとめいしょです。
This is Festivals and places of note.
kore wa matsuri to meisho desu.
これは祭りと名所です。

これはげんばくドームです。
This is Atomic Bomb Dome.
kore wa Genbaku Doomu desu.
これは原爆ドームです。

これはだいぶつです。
This is Great Buddha.
kore wa Daibutsu desu.
これは大仏です。

これはとうしょうぐうです。
This is Toshogu Shrine.
kore wa Toushouguu desu.
これは東照宮です。

`;

allSentences["Sentence 12 - Hard"] = ``;

allSentences["Sentence 13"] = `
そうしましょう。
Let's do that
sou shimashou
そうしましょう。

（しょうしょう）おまちください。
Please wait (for a moment)
(shoushou) omachi kudasai
（しょうしょう）おまちください。

そうですねをつかれます。
get tired Yes.
sou desu ne o tsukaremasu.
そうですねをつかれます。

さびしいをけっこんします。
marry lonely.
sabishii o kekkonshimasu.
さびしいをけっこんします。

ひろいをつりをします。
to fish wide.
hiroi o tsuri o shimasu.
ひろいをつりをします。

せまいをスキーをします。
to ski narrow.
semai o skii o shimasu.
せまいをスキーをします。

びじゅつをかいぎをします。
hold a meeting fine arts.
bijutsu o kaigi o shimasu.
びじゅつをかいぎをします。

ていしょくをとうろくをします。
to register set meal.
teishoku o touroku o shimasu.
ていしょくをとうろくをします。

たいへん（な）をおよぎます。
swim hard.
taihen na o oyogimasu.
たいへん（な）をおよぎます。

ほしいをむかえます。
go to meet want.
hoshii o mukaemasu.
ほしいをむかえます。

プールをだします。
take out swimming pool.
puuru o dashimasu.
プールをだします。

スキーを（みせに）はいります。
enter skiing.
skii o (mise ni) hairimasu.
スキーを（みせに）はいります。

かいぎを（みせを）でます。
go out meeting.
kaigi o (mise o) demasu.
かいぎを（みせを）でます。

しゅうまつをしょくじします。
have a meal weekend.
shuumatsu o shokujishimasu.
しゅうまつをしょくじします。

ロシアを（こうえんを）さんぽします。
take a walk Russia.
roshia o (kouen o) samposhimasu.
ロシアを（こうえんを）さんぽします。

しやくしょをあそびます。
enjoy oneself city hall.
shiyakusho o asobimasu.
しやくしょをあそびます。

けいざいをかいものします。
do shopping economy.
keizai o kaimonoshimasu.
けいざいをかいものします。

これはごろです。
This is about.
kore wa goro desu.
これはごろです。

これはつりです。
This is fishing.
kore wa tsuri desu.
これはつりです。

これはでんしじしょです。
This is electronic dictionary.
kore wa でんしじしょ desu.
これはでんしじしょです。

これはとうろくです。
This is registration.
kore wa touroku desu.
これはとうろくです。

これはごちゅうもんはです。
This is May I take your order?.
kore wa gochuumon wa desu.
これはごちゅうもんはです。

これはおなかがすきましたです。
This is .
kore wa onaka ga sukimashita desu.
これはおなかがすきましたです。

これはおなかがいっぱいですです。
This is .
kore wa onaka ga ippai desu desu.
これはおなかがいっぱいですです。

これはのどがかわきましたです。
This is .
kore wa nodo ga kawakimashita desu.
これはのどがかわきましたです。

これはぎゅうどんです。
This is bowl of rice topped with beef.
kore wa gyuudon desu.
これはぎゅうどんです。

これはかわです。
This is river.
kore wa kawa desu.
これはかわです。

これはなにかです。
This is something.
kore wa nanika desu.
これはなにかです。

これはどこかです。
This is somewhere.
kore wa dokoka desu.
これはどこかです。

これはべつべつにです。
This is separately.
kore wa betsubetsu ni desu.
これはべつべつにです。

これはえいがかんです。
This is cinema.
kore wa Eigakan desu.
これは映画館です。

これはどうぶつえんです。
This is zoo.
kore wa Doubutsuen desu.
これは動物園です。

これはにくやです。
This is butcher's shop.
kore wa Nikuya desu.
これは肉屋です。

これはさかやです。
This is off-licence.
kore wa Sakaya desu.
これは酒屋です。

これはびじゅつかんです。
This is art museum.
kore wa Bijutsukan desu.
これは美術館です。

これはとしょかんです。
This is library.
kore wa Toshokan desu.
これは図書館です。

これはゆうえんちです。
This is amusement park.
kore wa Yuuenchi desu.
これは遊園地です。

これはおてらです。
This is Buddhist temple.
kore wa Otera desu.
これはお寺です。

これはじんじゃです。
This is Shinto shrine.
kore wa Jinja desu.
これは神社です。

これはモスクです。
This is Mosque.
kore wa Mosuku desu.
これはモスクです。

これはこうえんです。
This is park.
kore wa Kouen desu.
これは公園です。

これはたいしかんです。
This is embassy.
kore wa Taishikan desu.
これは大使館です。

これはけいさつしょです。
This is police station.
kore wa Keisatsusho desu.
これは警察署です。

これはしょうぼうしょです。
This is fire station.
kore wa Shoubousho desu.
これは消防署です。

これはちゅうしゃじょうです。
This is car park.
kore wa Chuushajou desu.
これは駐車場です。

これはだいがくです。
This is university.
kore wa Daigaku desu.
これは大学です。

これはこうこうです。
This is senior high school.
kore wa Koukou desu.
これは高校です。

これはちゅうがっこうです。
This is junior high school.
kore wa Chuugakkou desu.
これは中学校です。

これはしょうがっこうです。
This is elementary school.
kore wa Shougakkou desu.
これは小学校です。

これはようちえんです。
This is kindergarten.
kore wa Youchien desu.
これは幼稚園です。

これはパンやです。
This is bakery.
kore wa Pan-ya desu.
これはパン屋です。

これはさかなやです。
This is fishmonger's.
kore wa Sakanaya desu.
これは魚屋です。

これはきっさてんです。
This is café.
kore wa Kissaten desu.
これは喫茶店です。

これはコンビニです。
This is convenience store.
kore wa Konbini desu.
これはコンビニです。

これはスーパーです。
This is supermarket.
kore wa Suupaa desu.
これはスーパーです。

これはデパートです。
This is department store.
kore wa Depaato desu.
これはデパートです。

これはにゅうこくかんりきょくです。
This is immigration bureau.
kore wa Nyuukokukanrikyoku desu.
これは入国管理局です。

これはきょうかいです。
This is Christian church.
kore wa Kyoukai desu.
これは教会です。

これはこうばんです。
This is police box.
kore wa Kouban desu.
これは交番です。

これははくぶつかんです。
This is museum.
kore wa Hakubutsukan desu.
これは博物館です。

これはたいいくかんです。
This is gymnasium.
kore wa Taiikukan desu.
これは体育館です。

これはしょくぶつえんです。
This is botanical garden.
kore wa Shokubutsuen desu.
これは植物園です。

これはやおやです。
This is greengrocer's.
kore wa Yaoya desu.
これは八百屋です。

`;

allSentences["Sentence 13 - Hard"] = ``;

allSentences["Sentence 14"] = `
しんごうをみぎへまがってください。
Turn to the right at the signal.
shingou o migi e magatte kudasai
しんごうをみぎへまがってください。

これでおねがいします。
I'd like to pay with this.
kore de onegaishimasu
これでおねがいします。

ゆっくりをおしえます。
tell slowly.
yukkuri o oshiemasu.
ゆっくりをおしえます。

すぐをはなします。
speak immediately.
sugu o hanashimasu.
すぐをはなします。

またをみせます。
show again.
mata o misemasu.
またをみせます。

あとでをはじめます。
start later.
atode o hajimemasu.
あとでをはじめます。

もうすこしをコピーします。
copy a little more.
mou sukoshi o kopii shimasu.
もうすこしをコピーします。

いいですよをつけます。
turn on Sure. Certainly.
ii desu yo o tsukemasu.
いいですよをつけます。

さあをけします。
turn off right.
saa o keshimasu.
さあをけします。

まっすぐをあけます。
open straight.
massugu o akemasu.
まっすぐをあけます。

しおをしめます。
close salt.
shio o shimemasu.
しおをしめます。

エアコンをまちます。
wait air conditioner.
eakon o machimasu.
エアコンをまちます。

パスポートをとめます。
stop passport.
pasupooto o tomemasu.
パスポートをとめます。

なまえを（みぎへ）まがります。
turn name.
namae o (migi e) magarimasu.
なまえを（みぎへ）まがります。

ちずをもちます。
hold map.
chizu o mochimasu.
ちずをもちます。

じゅうしょをよびます。
call address.
juusho o yobimasu.
じゅうしょをよびます。

さとうを（あめが）ふります。
to fall sugar.
satou o (ame ga) furimasu.
さとうを（あめが）ふります。

おつりをいそぎます。
hurry change.
otsuri o isogimasu.
おつりをいそぎます。

よみかたをとります。
take how to read.
yomikata o torimasu.
よみかたをとります。

てつだいます。
help.
tetsudaimasu.
てつだいます。

あれはじどうけんばいきです。
This/that is ticket machine.
are wa Jidou kenbaiki desu.
あれは自動券売機です。

もう、これはかたです。
This is how to ~.
mou, kore wa kata desu.
もう、これはかたです。

これはきっぷうりばです。
This is ticket office.
kore wa Kippu uriba desu.
これは切符売り場です。

これはちゅうおうぐちです。
This is central exit.
kore wa Chuuouguchi desu.
これは中央口です。

これはホームです。
This is platform.
kore wa hoomu desu.
これはプラットホームです。

これはタクシーのりばです。
This is taxi rank.
kore wa Takushii noriba desu.
これはタクシー乗り場です。

これはとうきょういきです。
This is for [TOKYO].
kore wa iki desu.
これは東京行きです。

これはえきです。
This is Station.
kore wa Eki desu.
これは駅です。

これはでぐちです。
This is exit.
kore wa Deguchi desu.
これは出口です。

これはいりぐちです。
This is entrance.
kore wa Iriguchi desu.
これは入り口です。

これはひがしぐちです。
This is east exit.
kore wa Higashiguchi desu.
これは東口です。

これはにしぐちです。
This is west exit.
kore wa Nishiguchi desu.
これは西口です。

これはみなみぐちです。
This is south exit.
kore wa Minamiguchi desu.
これは南口です。

これはきたぐちです。
This is north exit.
kore wa Kitaguchi desu.
これは北口です。

これはコインロッカーです。
This is coin locker.
kore wa Koin rokkaa desu.
これはコインロッカーです。

これはバスターミナルです。
This is bus terminal.
kore wa Basu taaminaru desu.
これはバスターミナルです。

これはバスていです。
This is bus stop.
kore wa Basutei desu.
これはバス停です。

これはとっきゅうです。
This is super-express train.
kore wa Tokkyuu desu.
これは特急です。

これはきゅうこうです。
This is express train.
kore wa Kyuukou desu.
これは急行です。

これはふつうです。
This is local train.
kore wa Futsuu desu.
これは普通です。

これはじこくひょうです。
This is timetable.
kore wa Jikokuhyou desu.
これは時刻表です。

これはかいさつぐちです。
This is ticket barrier.
kore wa Kaisatsuguchi desu.
これは改札口です。

これはかいすうけんです。
This is coupon ticket.
kore wa Kaisuuken desu.
これは回数券です。

これはていきけんです。
This is season ticket.
kore wa Teikiken desu.
これは定期券です。

これはせいさんきです。
This is fare adjustment machine.
kore wa Seisanki desu.
これは精算機です。

これはばいてんです。
This is kiosk.
kore wa Baiten desu.
これは売店です。

これはかいそくです。
This is rapid service train.
kore wa Kaisoku desu.
これは快速です。

これはじゅんきゅうです。
This is semi-express train.
kore wa Junkyuu desu.
これは準急です。

これははつです。
This is departing ～.
kore wa hatsu desu.
これは発です。

これはちゃくです。
This is arriving at ～.
kore wa chaku desu.
これは着です。

これはかたみちです。
This is one way.
kore wa Katamichi desu.
これは片道です。

これはおうふくです。
This is return/round trip.
kore wa Oufuku desu.
これは往復です。

`;

allSentences["Sentence 14 - Hard"] = ``;

allSentences["Sentence 15"] = `
いらっしゃいます。
be (honorific equivalent of imasu)
irasshaimasu
いらっしゃいます。

ふくをけんきゅうします。
to research clothes.
fuku o kenkyuu shimasu.
ふくをけんきゅうします。

すんでいます。
live.
sundeimasu.
すんでいます。

おおさかにすんでいます。
live in Osaka.
oosaka ni sundeimasu.
おおさかにすんでいます。

カタログをつくります。
make catalog.
katarogu o tsukurimasu.
カタログをつくります。

ごかぞくをしります。
get to know your family.
gokazoku o shirimasu.
ごかぞくをしります。

しっています。
know.
shitteimasu.
しっています。

ソフトをおもいだします。
remember software.
sofuto o omoidashimasu.
ソフトをおもいだします。

こうこうをたちます。
stand up senior high school.
koukou o tachimasu.
こうこうをたちます。

せいひんをすわります。
sit down products.
seihin o suwarimasu.
せいひんをすわります。

つかいます。
use.
tsukaimasu.
つかいます。

じこくひょうにおきます。
put timetable.
jikokuhyou ni okimasu.
じこくひょうにおきます。

プレイガイドをうります。
sell .
pureigaido o urimasu.
プレイガイドをうります。

すみます。
to live.
sumimasu.
すみます。

これはしりょうです。
This is materials.
kore wa shiryou desu.
これはしりょうです。

これはどくしんです。
This is single.
kore wa dokushin desu.
これはどくしんです。

これはとくにです。
This is especially.
kore wa tokuni desu.
これはとくにです。

これはせんもんです。
This is specialty.
kore wa senmon desu.
これはせんもんです。

これははいしゃです。
This is dentist.
kore wa haisha desu.
これははいしゃです。

これはスポーツせんしゅです。
This is athlete.
kore wa Supootsu senshu desu.
これはスポーツ選手です。

これはせいじかです。
This is politician.
kore wa Seijika desu.
これは政治家です。

これはおんがくかです。
This is musician.
kore wa Ongakuka desu.
これは音楽家です。

これはえきいんです。
This is station attendant.
kore wa Ekiin desu.
これは駅員です。

これはうんてんしゅです。
This is driver.
kore wa Untenshu desu.
これは運転手です。

これはけいさつかんです。
This is policeman.
kore wa Keisatsukan desu.
これは警察官です。

これはかいしゃいんです。
This is company employee.
kore wa Kaishain desu.
これは会社員です。

これはぎんこういんです。
This is bank employee.
kore wa Ginkouin desu.
これは銀行員です。

これはゆうびんきょくいんです。
This is postman.
kore wa Yuubinkyokuin desu.
これは郵便局員です。

これはてんいんです。
This is shop assistant.
kore wa Tenin desu.
これは店員です。

これはきょうしです。
This is teacher.
kore wa Kyoushi desu.
これは教師です。

これはべんごしです。
This is solicitor.
kore wa Bengoshi desu.
これは弁護士です。

これはけんきゅうしゃです。
This is research worker.
kore wa Kenkyuusha desu.
これは研究者です。

これはエンジニアです。
This is engineer.
kore wa Enjinia desu.
これはエンジニアです。

これはデザイナーです。
This is designer.
kore wa Dezainaa desu.
これはデザイナーです。

これはジャーナリストです。
This is journalist.
kore wa Jaanarisuto desu.
これはジャーナリストです。

これはしょくぎょうです。
This is Occupations.
kore wa shokugyou desu.
これは職業です。

これはこうむいんです。
This is civil servant.
kore wa Koumuin desu.
これは公務員です。

これはちょうりしです。
This is cook.
kore wa Chourishi desu.
これは調理師です。

これはりようしです。
This is barber.
kore wa Riyoushi desu.
これは理容師です。

これはびようしです。
This is beautician.
kore wa Biyoushi desu.
これは美容師です。

これはかんごしです。
This is nurse.
kore wa Kangoshi desu.
これは看護師です。

これはがいこうかんです。
This is diplomat.
kore wa Gaikoukan desu.
これは外交官です。

これはがかです。
This is painter.
kore wa Gaka desu.
これは画家です。

これはさっかです。
This is author.
kore wa Sakka desu.
これは作家です。

これはけんちくかです。
This is architect.
kore wa Kenchikuka desu.
これは建築家です。

これはかしゅです。
This is singer.
kore wa Kashu desu.
これは歌手です。

これははいゆうです。
This is actor.
kore wa Haiyuu desu.
これは俳優です。

`;

allSentences["Sentence 15 - Hard"] = ``;

allSentences["Sentence 16"] = `
おひきだしですか。
Are you making a withdrawal?
ohikidashi desu ka
おひきだしですか。

あたまがいいを（シャワーを）あびます。
bathe clever.
atama ga ii o (shawaa o) abimasu.
あたまがいいを（シャワーを）あびます。

あたまをだします。
take out head.
atama o dashimasu.
あたまをだします。

かみをかくにんします。
confirm hair.
kami o kakunin shimasu.
かみをかくにんします。

かおを（だいがくに）はいります。
enter face.
kao o (daigaku ni) hairimasu.
かおを（だいがくに）はいります。

サービスを（だいがくを）でます。
graduate service.
saabisu o (daigaku o) demasu.
サービスを（だいがくを）でます。

みどりをジョギングをします。
jog green.
midori o jogingu o shimasu.
みどりをジョギングをします。

どうやってをおします。
push how.
douyatte o oshimasu.
どうやってをおします。

どのをいれます。
put in which ~.
dono o iremasu.
どのをいれます。

いいえ、まだまだですを（でんしゃに）のります。
ride No I still have a long way to go.
iie mada mada desu o (densha ni) norimasu.
いいえ、まだまだですを（でんしゃに）のります。

わたしは（でんしゃを）おります。
I am here (humble).
watashi wa (densha o) orimasu.
わたしは（でんしゃを）おります。

キャッシュカードを（でんしゃに）のりかえます。
change cash card.
kyasshu kaado o (densha ni) norikaemasu.
キャッシュカードを（でんしゃに）のりかえます。

つぎにをやめます。
quit next.
tsugi ni o yamemasu.
つぎにをやめます。

ボタンをはいります。
enter button.
botan o hairimasu.
ボタンをはいります。

これはアジアです。
This is Asia.
kore wa ajia desu.
これはアジアです。

これはバンドンです。
This is Bandung.
kore wa bandon desu.
これはバンドンです。

これはベラクルスです。
This is Veracruz.
kore wa berakurusu desu.
これはベラクルスです。

これはフランケンです。
This is Franken.
kore wa furanken desu.
これはフランケンです。

これはベトナムです。
This is Vietnam.
kore wa betonamu desu.
これはベトナムです。

これはフエです。
This is Hue.
kore wa fue desu.
これはフエです。

これはわかいです。
This is young.
kore wa wakai desu.
これはわかいです。

これはながいです。
This is long.
kore wa nagai desu.
これはながいです。

これはあかるいです。
This is bright.
kore wa akarui desu.
これはあかるいです。

これはおなかです。
This is stomach.
kore wa onaka desu.
これはおなかです。

これははなです。
This is nose.
kore wa hana desu.
これははなです。

これはジョギングです。
This is jogging.
kore wa jogingu desu.
これはジョギングです。

これはシャワーです。
This is shower.
kore wa shawaa desu.
これはシャワーです。

これはばんです。
This is number ~.
kore wa ban desu.
これはばんです。

これはおろしますおかねをです。
This is withdraw.
kore wa oroshimasu desu.
これはおろしますおかねをです。

これはおてらです。
This is Buddhist temple.
kore wa otera desu.
これはおてらです。

これはあんしょうばんごうです。
This is personal identification number.
kore wa anshou bangou desu.
これはあんしょうばんごうです。

これはかくにんです。
This is confirmation.
kore wa kakunin desu.
これはかくにんです。

これはきんがくです。
This is amount of money.
kore wa kingaku desu.
これはきんがくです。

これはみじかいです。
This is short.
kore wa mijikai desu.
これはみじかいです。

これはくらいです。
This is dark.
kore wa kurai desu.
これはくらいです。

これはせがたかいです。
This is tall.
kore wa se ga takai desu.
これはせがたかいです。

これはからだです。
This is body.
kore wa karada desu.
これはからだです。

これはめです。
This is eye.
kore wa me desu.
これはめです。

これはみみです。
This is ear.
kore wa mimi desu.
これはみみです。

これはくちです。
This is mouth.
kore wa kuchi desu.
これはくちです。

これははです。
This is tooth.
kore wa ha desu.
これははです。

これはあしです。
This is foot.
kore wa ashi desu.
これはあしです。

これはじんじゃです。
This is Shinto shrine.
kore wa jinja desu.
これはじんじゃです。

これはりゅうがくせいです。
This is foreign student.
kore wa ryuugakusei desu.
これはりゅうがくせいです。

これはまずです。
This is first of all.
kore wa mazu desu.
これはまずです。

これはジェイアールです。
This is Japan Railway.
kore wa jei aaru desu.
これはジェイアールです。

これはせです。
This is height.
kore wa せ desu.
これはせです。

これはおひきだしです。
This is withdrawal.
kore wa Ohikidashi desu.
これはお引き出しです。

これはえんです。
This is YEN.
kore wa En desu.
これは円です。

これはつうちょうきにゅうです。
This is updating your passbook.
kore wa Tsuuchoukinyuu desu.
これは通帳記入です。

これはざんだかしょうかいです。
This is balance inquiry.
kore wa Zandakashoukai desu.
これは残高照会です。

これはおあずけいれです。
This is deposit.
kore wa Oazukeire desu.
これはお預け入れです。

これはおふりこみです。
This is payment.
kore wa Ofurikomi desu.
これはお振り込みです。

これはおふりかえです。
This is transfer.
kore wa Ofurikae desu.
これはお振り替えです。

`;

allSentences["Sentence 16 - Hard"] = ``;

allSentences["Sentence 17"] = `
ですから。
therefore, so
desu kara
ですから。

どう しましたか。
What seems to be the problem?
Dou shimashita ka.
どう しましたか。

これはあごです。
This is chin.
kore wa Ago desu.
これは顎です。

ねつをわすれます。
forget fever.
netsu o wasuremasu.
ねつをわすれます。

こたえを（レポートを）だします。
hand in answer.
kotae o (repooto o) dashimasu.
こたえを（レポートを）だします。

おだいじにをでかけます。
go out Take care of yourself. Get well soon.
odaijini o dekakemasu.
おだいじにをでかけます。

どうしましたかをしんぱいします。
worry What's the matter?.
doushimashita ka o shinpaishimasu.
どうしましたかをしんぱいします。

びょうきを（おふろに）はいります。
take illness.
byouki o (ofuro ni) hairimasu.
びょうきを（おふろに）はいります。

たいせつ（な）を（くすりを）のみます。
take important.
taisetsu na o (kusuri o) nomimasu.
たいせつ（な）を（くすりを）のみます。

もんだいをしゅっちょうします。
go on a business trip question.
mondai o shucchoushimasu.
もんだいをしゅっちょうします。

だいじょうぶ（です）をざんぎょうします。
work overtime it's all right.
daijoubu desu o zangyoushimasu.
だいじょうぶ（です）をざんぎょうします。

あぶないをおぼえます。
memorize dangerous.
abunai o oboemasu.
あぶないをおぼえます。

かぜをなくします。
lose cold.
kaze o nakushimasu.
かぜをなくします。

せんせいをかえします。
give back doctor.
sensei o kaeshimasu.
せんせいをかえします。

くすりをぬぎます。
take off medicine.
kusuri o nugimasu.
くすりをぬぎます。

にさんにちにもっていきます。
take a few days.
ni san nichi ni motteikimasu.
にさんにちにもっていきます。

にさんにもってきます。
bring a few ~.
ni san ni mottekimasu.
にさんにもってきます。

はらいます。
pay.
haraimasu.
はらいます。

ねつがあります。
have a temperature.
Netsu ga arimasu.
熱があります。

おふろをはきけがします。
feel sick bath.
ofuro o Hakike ga shimasu.
おふろを吐き気がします。

のどをさむけがします。
feel a chill throat.
nodo o Samuke ga shimasu.
のどを寒気がします。

（けんこう）ほけんしょうをめまいがします。
feel dizzy .
(kenkou) hokenshou o Memai ga shimasu.
（けんこう）ほけんしょうをめまいがします。

きんえんをげりをします。
have diarrhoea no smoking.
kinen o Geri wo shimasu.
きんえんを下痢をします。

うわぎをべんぴをします。
be constipated jacket.
uwagi o Benpi wo shimasu.
うわぎを便秘をします。

したぎをけがをします。
get injured underwear.
shitagi o Kega wo shimasu.
したぎをけがをします。

しょくよくがありませんをやけどをします。
get burnt have no appetite.
Shokuyoku ga arimasen o Yakedo wo shimasu.
食欲がありませんをやけどをします。

インフルエンザをかたがこります。
feel stiff in one's shoulders flu.
Infuruenza o Kata ga korimasu.
インフルエンザを肩がこります。

せなかをせきがでます。
have a cough back.
Senaka o Seki ga demasu.
背中をせきが出ます。

あたまがいたいをはなみずがでます。
have a runny nose have a headache.
Atama ga itai o Hanamizu ga demasu.
頭が痛いを鼻水が出ます。

おなかがいたいをちがでます。
bleed have a stomachache.
Onaka ga itai o Chi ga demasu.
おなかが痛いを血が出ます。

これはまでにです。
This is before ~.
kore wa made ni desu.
これはまでにです。

これはがいたいですです。
This is ~ hurts.
kore wa ga itai desu desu.
これはがいたいですです。

これははがいたいです。
This is have a toothache.
kore wa Ha ga itai desu.
これは歯が痛いです。

これはあたまです。
This is head.
kore wa Atama desu.
これは頭です。

これはかみです。
This is hair.
kore wa Kami desu.
これは髪です。

これはみみです。
This is ear.
kore wa Mimi desu.
これは耳です。

これはあしです。
This is leg.
kore wa Ashi desu.
これは足です。

これはてです。
This is hand.
kore wa Te desu.
これは手です。

これはおなかです。
This is stomach.
kore wa Onaka desu.
これはお腹です。

これはくちです。
This is mouth.
kore wa Kuchi desu.
これは口です。

これははなです。
This is nose.
kore wa Hana desu.
これは鼻です。

これはめです。
This is eye.
kore wa Me desu.
これは目です。

これはかおです。
This is face.
kore wa Kao desu.
これは顔です。

これはもうちょうです。
This is appendicitis.
kore wa Mouchou desu.
これは盲腸です。

これはぎっくりごしです。
This is slipped disc.
kore wa Gikkurigoshi desu.
これはぎっくり腰です。

これはからだがだるいです。
This is feel weary.
kore wa Karada ga darui desu.
これは体がだるいです。

これはかゆいです。
This is itchy.
kore wa Kayui desu.
これはかゆいです。

これはねんざです。
This is sprain.
kore wa Nenza desu.
これはねんざです。

これはこっせつです。
This is bone fracture.
kore wa Kossetsu desu.
これは骨折です。

これはふつかよいです。
This is hangover.
kore wa Futsukayoi desu.
これは二日酔いです。

これはこしです。
This is waist.
kore wa Koshi desu.
これは腰です。

これはしりです。
This is bottom.
kore wa Shiri desu.
これは尻です。

これはほねです。
This is bone.
kore wa Hone desu.
これは骨です。

これはゆびです。
This is finger.
kore wa Yubi desu.
これは指です。

これはつめです。
This is nail.
kore wa Tsume desu.
これは爪です。

これはひざです。
This is knee.
kore wa Hiza desu.
これは膝です。

これはひじです。
This is elbow.
kore wa Hiji desu.
これは肘です。

これはうでです。
This is arm.
kore wa Ude desu.
これは腕です。

これはむねです。
This is chest.
kore wa Mune desu.
これは胸です。

これはかたです。
This is shoulder.
kore wa Kata desu.
これは肩です。

これはくびです。
This is neck.
kore wa Kubi desu.
これは首です。

`;

allSentences["Sentence 17 - Hard"] = ``;

allSentences["Sentence 18"] = `
ほんとうですか。
Really?
hontou desu ka
ほんとうですか。

それはおもしろいですねにできます。
be able to That must be interesting.
sore wa omoshiroi desu ne ni dekimasu.
それはおもしろいですねにできます。

うたいます。
sing.
utaimasu.
うたいます。

へえをおいのりをします。
pray Oh really!.
hee o oinori o shimasu.
へえをおいのりをします。

あらいます。
wash.
araimasu.
あらいます。

ピアノにひきます。
play piano.
piano ni hikimasu.
ピアノにひきます。

かちょうをあつめます。
collect section chief.
kachou o atsumemasu.
かちょうをあつめます。

ぶちょうをすてます。
throw away department chief.
buchou o sutemasu.
ぶちょうをすてます。

しゃちょうをかえます。
replace president of a company.
shachou o kaemasu.
しゃちょうをかえます。

こくさいをうんてんします。
drive international~.
kokusai o unten shimasu.
こくさいをうんてんします。

げんきんをよやくします。
reserve cash.
genkin o yoyaku shimasu.
げんきんをよやくします。

にっきをけんがくします。
visit some place to study diary.
nikki o kengaku shimasu.
にっきをけんがくします。

これはメートルです。
This is ~meter.
kore wa meetoru desu.
これはメートルです。

これはおいのりです。
This is prayer.
kore wa inori desu.
これはおいのりです。

これはぼくじょうです。
This is ranch.
kore wa bokujou desu.
これはぼくじょうです。

これはしゅみです。
This is hobby.
kore wa shumi desu.
これはしゅみです。

これはどうぶつです。
This is animal.
kore wa doubutsu desu.
これはどうぶつです。

これはうまです。
This is horse.
kore wa uma desu.
これはうまです。

これはなかなかです。
This is not easily.
kore wa nakanaka desu.
これはなかなかです。

これはぜひです。
This is by all means.
kore wa zehi desu.
これはぜひです。

これはインターネットです。
This is the Internet.
kore wa intaanetto desu.
これはインターネットです。

これはうごきです。
This is Actions.
kore wa ugoki desu.
これは動きです。

これはのぼるです。
This is climb.
kore wa Noboru desu.
これは登るです。

これははしるです。
This is run.
kore wa Hashiru desu.
これは走るです。

これはおよぐです。
This is swim.
kore wa Oyogu desu.
これは泳ぐです。

これはけるです。
This is kick.
kore wa Keru desu.
これはけるです。

これはひくです。
This is pull.
kore wa Hiku desu.
これは引くです。

これはおすです。
This is push.
kore wa Osu desu.
これは押すです。

これはとぶです。
This is fly.
kore wa Tobu desu.
これは飛ぶです。

これはまぐろです。
This is tuna.
kore wa maguro desu.
これはまぐろです。

これはもぐるです。
This is dive.
kore wa Moguru desu.
これはもぐるです。

これはまげるです。
This is bend.
kore wa Mageru desu.
これは曲げるです。

これはとびこむです。
This is dive into.
kore wa Tobikomu desu.
これは飛び込むです。

これはさかだちするです。
This is do a handstand.
kore wa Sakadachisuru desu.
これは逆立ちするです。

これははうです。
This is crawl.
kore wa Hau desu.
これははうです。

これはふるです。
This is wave.
kore wa Furu desu.
これは振るです。

これはもちあげるです。
This is lift.
kore wa Mochiageru desu.
これは持ち上げるです。

これはなげるです。
This is throw.
kore wa Nageru desu.
これは投げるです。

これはたたくです。
This is pat.
kore wa Tataku desu.
これはたたくです。

これはのばすです。
This is extend.
kore wa Nobasu desu.
これは伸ばすです。

これはころぶです。
This is fall down.
kore wa Korobu desu.
これは転ぶです。

これはふりむくです。
This is look back.
kore wa Furimuku desu.
これは振り向くです。

`;

allSentences["Sentence 18 - Hard"] = ``;

allSentences["Sentence 19"] = `
これはまんざい・らくごです。
This is manzai.
kore wa Manzai, Rakugo desu.
これは漫才・落語です。

ねむいをゴルフをします。
play golf sleepy.
nemui o gorufu o shimasu.
ねむいをゴルフをします。

つよいをダイエットをします。
go on a diet strong.
tsuyoi o daietto o shimasu.
つよいをダイエットをします。

よわいをやまをのぼります。
climb a mountain weak.
yowai o yama o noborimasu.
よわいをやまをのぼります。

おかげさまでをホテルにとまります。
stay in a hotel Thank you. All thanks to you..
okagesama de o hoteru ni tomarimasu.
おかげさまでをホテルにとまります。

もうすぐをふくをせんたくします。
wash the clothes very soon.
mou sugu o fuku o sentaku shimasu.
もうすぐをふくをせんたくします。

むり（な）をれんしゅうします。
to practice impossible.
muri na o renshuu shimasu.
むり（な）をれんしゅうします。

からだにいいをダンスをれんしゅうします。
practice the dance good for one's body.
karada ni ii o dansu o renshuu shimasu.
からだにいいをダンスをれんしゅうします。

あしたにじゅうさんさいになります。
turn 23 years old tomorrow.
ashita nijuusan sai ni narimasu.
あしたにじゅうさんさいになります。

ゴルフをのぼります。
climb golf.
gorufu o noborimasu.
ゴルフをのぼります。

こどものひをとまります。
stay Children's Day.
Kodomo no Hi o tomarimasu.
こどものひをとまります。

ちょうしがいいをそうじします。
clean be in a good condition.
choushi ga ii o souji shimasu.
ちょうしがいいをそうじします。

ちょうしがわるいをせんたくします。
do the laundry be in a bad condition.
choushi ga warui o sentaku shimasu.
ちょうしがわるいをせんたくします。

なります。
become.
narimasu.
なります。

これはひです。
This is day.
kore wa hi desu.
これはひです。

これはダイエットです。
This is diet.
kore wa daietto desu.
これはダイエットです。

これはケーキです。
This is cake.
kore wa keeki desu.
これはケーキです。

これはすもうです。
This is sumo wrestling.
kore wa すもう desu.
これはすもうです。

これはさどうです。
This is tea ceremony.
kore wa sadou desu.
これはさどうです。

これはれんしゅうです。
This is practice.
kore wa renshuu desu.
これはれんしゅうです。

これはちょうしです。
This is condition.
kore wa choushi desu.
これはちょうしです。

これはパチンコです。
This is Japanese pinball game.
kore wa pachinko desu.
これはパチンコです。

これはだんだんです。
This is gradually.
kore wa dandan desu.
これはだんだんです。

これはかんぱいです。
This is bottoms up / cheers.
kore wa kanpai desu.
これはかんぱいです。

これはしかしです。
This is but.
kore wa shikashi desu.
これはしかしです。

これはいちどです。
This is once.
kore wa ichido desu.
これはいちどです。

これはいちどもです。
This is not even once.
kore wa ichidomo desu.
これはいちどもです。

これはじつはです。
This is actually..
kore wa jitsu wa desu.
これはじつはです。

これはなんかいもです。
This is many times.
kore wa nankai mo desu.
これはなんかいもです。

これはいご・しょうぎです。
This is go.
kore wa Igo, Shougi desu.
これは囲碁・将棋です。

これはかぶきです。
This is Kabuki.
kore wa Kabuki desu.
これは歌舞伎です。

これはのうです。
This is Noh.
kore wa Nou desu.
これは能です。

これはぶんらくです。
This is Bunraku.
kore wa Bunraku desu.
これは文楽です。

これはじゅうどうです。
This is judo.
kore wa Juudou desu.
これは柔道です。

これはけんどうです。
This is kendo.
kore wa Kendou desu.
これは剣道です。

これはからてです。
This is karate.
kore wa Karate desu.
これは空手です。

これはカラオケです。
This is karaoke.
kore wa Karaoke desu.
これはカラオケです。

これはでんとうぶんか・ごらくです。
This is Traditional culture and entertainment.
kore wa dentou bunka / goraku desu.
これは伝統文化・娯楽です。

これはかどうです。
This is flower arranging.
kore wa Kadou desu.
これは華道です。

これはしょどうです。
This is calligraphy.
kore wa Shodou desu.
これは書道です。

これはぼんおどりです。
This is Bon dance.
kore wa Bon odori desu.
これは盆踊りです。

`;

allSentences["Sentence 19 - Hard"] = ``;

allSentences["Sentence 20"] = `
たろうくんです。
This is Taro-kun.
tarou kun desu.
たろうくんです。

どうするのをでんわします。
phone What will you do?.
dou suru no o denwa shimasu.
どうするのをでんわします。

いろいろを（ビザが）いります。
need various.
iroiro o (biza ga) irimasu.
いろいろを（ビザが）いります。

おわりをしらべます。
check the end.
owari o shirabemasu.
おわりをしらべます。

みんなでをなおします。
correct all together.
minna de o naoshimasu.
みんなでをなおします。

うんをしゅうりします。
repair yes.
un o shuuri shimasu.
うんをしゅうりします。

これはううんです。
This is no.
kore wa uun desu.
これはううんです。

これはきものです。
This is traditional Japanese attire.
kore wa kimono desu.
これはきものです。

これはサラリーマンです。
This is office worker.
kore wa sarariiman desu.
これはサラリーマンです。

これはビザです。
This is visa.
kore wa biza desu.
これはビザです。

これははじめです。
This is the beginning.
kore wa hajime desu.
これははじめです。

これはこっちです。
This is this way.
kore wa kocchi desu.
これはこっちです。

これはそっちです。
This is that way.
kore wa socchi desu.
これはそっちです。

これはあっちです。
This is that way.
kore wa acchi desu.
これはあっちです。

これはどっちです。
This is which one.
kore wa docchi desu.
これはどっちです。

これはぼくです。
This is I.
kore wa boku desu.
これはぼくです。

これはきみです。
This is you.
kore wa kimi desu.
これはきみです。

これはことばです。
This is word.
kore wa kotoba desu.
これはことばです。

これはぶっかです。
This is commodity prices.
kore wa bukka desu.
これはぶっかです。

これはこのあいだです。
This is the other day.
kore wa kono aida desu.
これはこのあいだです。

これはけどです。
This is ~but.
kore wa kedo desu.
これはけどです。

これはくにへかえるのです。
This is Are you going back to your country?.
kore wa kuni e kaeru no desu.
これはくにへかえるのです。

これはどうしようかなです。
This is What shall I do?.
kore wa dou shiyou kana desu.
これはどうしようかなです。

これはよかったら…です。
This is if you like...
kore wa yokattara... desu.
これはよかったら…です。

これはひとのよびかたです。
This is How to address people.
kore wa hito no yobikata desu.
これは人の呼び方です。

これはせんせいです。
This is Doctor / Teacher / Professor.
kore wa Sensei desu.
これは先生です。

これはぶちょうです。
This is department head.
kore wa Buchou desu.
これは部長です。

これはおきゃくさまです。
This is Mr./Ms. Customer.
kore wa Okyakusama desu.
これはお客様です。

これはおにあいですよです。
This is It looks good on you / You two look great together.
kore wa oniai desu yo desu.
これはお似合いですよです。

これはいたいんですです。
This is It hurts.
kore wa itai ndesu desu.
これは痛いんですです。

`;

allSentences["Sentence 20 - Hard"] = ``;

allSentences["Sentence 21"] = `
〜でものみませんか。
How about drinking ~ or something?
~ demo nomimasen ka
〜でものみませんか。

ないかくそうりだいじんです。
This person is prime minister.
Naikaku souri daijin desu.
内閣総理大臣です。

ラッシュをまけます。
lose rush hour.
rasshu o makemasu.
ラッシュをまけます。

ユーモアをおはなしをします。
talk humor.
yuumoa o ohanashi o shimasu.
ユーモアをおはなしをします。

おなじをアルバイトをします。
work a part-time job the same.
onaji o arubaito o shimasu.
おなじをアルバイトをします。

きっとをスピーチをします。
make/deliver a speech surely.
kitto o supiichi o shimasu.
きっとをスピーチをします。

もちろんをやくにたちます。
be useful of course.
mochiron o yakunitachimasu.
もちろんをやくにたちます。

おもいます。
think.
omoimasu.
おもいます。

いいます。
say.
iimasu.
いいます。

すごいをたります。
be enough awful.
sugoi o tarimasu.
すごいをたります。

むだ（な）をかちます。
win wasteful.
muda na o kachimasu.
むだ（な）をかちます。

あります。
be held.
arimasu.
あります。

これはむだです。
This is waste.
kore wa muda desu.
これはむだです。

これはたぶんです。
This is probably.
kore wa tabun desu.
これはたぶんです。

これはほんとうにです。
This is really.
kore wa hontou ni desu.
これはほんとうにです。

これはニュースです。
This is news.
kore wa nyuusu desu.
これはニュースです。

これはスピーチです。
This is speech.
kore wa supiichi desu.
これはスピーチです。

これはデザインです。
This is design.
kore wa dezain desu.
これはデザインです。

これはカンガルーです。
This is kangaroo.
kore wa kangaruu desu.
これはカンガルーです。

これはゆめです。
This is dream.
kore wa yume desu.
これはゆめです。

これはてんさいです。
This is genius.
kore wa てんさい desu.
これはてんさいです。

これはしゅしょうです。
This is prime minister.
kore wa shushou desu.
これはしゅしょうです。

これはだいとうりょうです。
This is president.
kore wa daitouryou desu.
これはだいとうりょうです。

これはほうそうです。
This is announcement.
kore wa ほうそう desu.
これはほうそうです。

これはいけんです。
This is opinion.
kore wa iken desu.
これはいけんです。

これはこうつうです。
This is transportation.
kore wa koutsuu desu.
これはこうつうです。

これはについてです。
This is about ~.
kore wa ni tsuite desu.
これはについてです。

これはしかたがありませんです。
This is There is no other choice. / It can't be helped.
kore wa shikata ga arimasen desu.
これはしかたがありませんです。

これはしばらくですねです。
This is It's been a long time. / Long time no see.
kore wa shibaraku desu ne desu.
これはしばらくですねです。

これはふべん（な）です。
This is inconvenient.
kore wa fuben na desu.
これはふべん（な）です。

これはせいじです。
This is politics.
kore wa seiji desu.
これはせいじです。

これはしあいです。
This is game.
kore wa shiai desu.
これはしあいです。

これはアルバイトです。
This is side job.
kore wa arubaito desu.
これはアルバイトです。

これはさいきんです。
This is recently.
kore wa saikin desu.
これはさいきんです。

これはおはなしです。
This is talk.
kore wa hanashi desu.
これはおはなしです。

これはそんなにです。
This is not so much.
kore wa sonnani desu.
これはそんなにです。

これはみないと…です。
This is I've got to watch it.
kore wa minaito... desu.
これはみないと…です。

これはだいがくです。
This is university.
kore wa Daigaku desu.
これは大学です。

これはこうとうがっこうです。
This is upper secondary.
kore wa Koutougakkou desu.
これは高等学校です。

これはちゅうがっこうです。
This is lower secondary.
kore wa Chuugakkou desu.
これは中学校です。

これはしょうがっこうです。
This is primary.
kore wa Shougakkou desu.
これは小学校です。

これはようちえんです。
This is kindergarten.
kore wa Youchien desu.
これは幼稚園です。

これはかちょうです。
This is section head.
kore wa Kachou desu.
これは課長です。

これはぶちょうです。
This is department head.
kore wa Buchou desu.
これは部長です。

これはしゃちょうです。
This is president.
kore wa Shachou desu.
これは社長です。

これはぎんこうです。
This is bank.
kore wa Ginkou desu.
これは銀行です。

これはえきです。
This is station.
kore wa Eki desu.
これは駅です。

これはびょういんです。
This is hospital.
kore wa Byouin desu.
これは病院です。

これはかいしゃです。
This is company.
kore wa Kaisha desu.
これは会社です。

これはくにです。
This is nation.
kore wa Kuni desu.
これは国です。

これはやくしょくめいです。
This is Positions in society.
kore wa yakushokumei desu.
これは役職名です。

これはがくちょうです。
This is [university] president.
kore wa Gakuchou desu.
これは学長です。

これはこうちょうです。
This is [school] head teacher.
kore wa Kouchou desu.
これは校長です。

これはえんちょうです。
This is [kindergarten] head teacher.
kore wa Enchou desu.
これは園長です。

これはとうどりです。
This is [bank] president.
kore wa Toudori desu.
これは頭取です。

これはしてんちょうです。
This is branch manager.
kore wa Shitenchou desu.
これは支店長です。

これはけいさつです。
This is police station.
kore wa Keisatsu desu.
これは警察です。

これはしょちょうです。
This is officer in charge.
kore wa Shochou desu.
これは署長です。

これはえきちょうです。
This is stationmaster.
kore wa Ekichou desu.
これは駅長です。

これはいんちょうです。
This is [hospital] director.
kore wa Inchou desu.
これは院長です。

これはかんごしちょうです。
This is head nurse.
kore wa Kangoshichou desu.
これは看護師長です。

これはかいちょうです。
This is chairman.
kore wa Kaichou desu.
これは会長です。

これはじゅうやくです。
This is director.
kore wa Juuyaku desu.
これは重役です。

これはとどうふけんです。
This is prefecture.
kore wa Todoufuken desu.
これは都道府県です。

これはしです。
This is city.
kore wa Shi desu.
これは市です。

これはまちです。
This is town.
kore wa Machi desu.
これは町です。

これはむらです。
This is village.
kore wa Mura desu.
これは村です。

これはちじです。
This is governor.
kore wa Chiji desu.
これは知事です。

これはしちょうです。
This is city mayor.
kore wa Shichou desu.
これは市長です。

これはちょうちょうです。
This is town mayor.
kore wa Chouchou desu.
これは町長です。

これはそんちょうです。
This is village headman.
kore wa Sonchou desu.
これは村長です。

`;

allSentences["Sentence 21 - Hard"] = ``;

allSentences["Sentence 22"] = `
おさがしですか。
Are you looking for ～?
osagashi desu ka
おさがしですか。

おめでとうございます。
Congratulations.
omedetou gozaimasu
おめでとうございます。

めがねにきます。
wear glasses.
megane ni kimasu.
めがねにきます。

ダイニングキッチンにはきます。
wear kitchen with a dining area.
dainingu kicchin ni hakimasu.
ダイニングキッチンにはきます。

ふとんをかぶります。
wear Japanese-style mattress and quilt.
futon o kaburimasu.
ふとんをかぶります。

よくをかけます。
wear often.
yoku o kakemasu.
よくをかけます。

うーんをうまれます。
be born ummm...
uun o umaremasu.
うーんをうまれます。

パリをつけます。
wear Paris.
pari o tsukemasu.
パリをつけます。

コートをします。
wear coat.
kooto o shimasu.
コートをします。

スーツをはめます。
wear suit.
suutsu o hamemasu.
スーツをはめます。

セーターにまきます。
wear around the neck sweater.
seetaa ni makimasu.
セーターにまきます。

ぼうしをしめます。
wear hat.
boushi o shimemasu.
ぼうしをしめます。

アパートはこちらです。
apartment is this.
apaato wa kochira desu.
アパートはこちらです。

これはばんりのちょうじょうです。
This is the Great Wall of China.
kore wa banri no choujou desu.
これはばんりのちょうじょうです。

これはやちんです。
This is house rent.
kore wa yachin desu.
これはやちんです。

これはわしつです。
This is Japanese-style room.
kore wa washitsu desu.
これはわしつです。

これはおしいれです。
This is Japanese-style closet.
kore wa oshiire desu.
これはおしいれです。

これはくつしたです。
This is socks.
kore wa Kutsushita desu.
これはくつしたです。

これはいふくです。
This is Clothes.
kore wa ifuku desu.
これは衣服です。

これはてぶくろです。
This is gloves.
kore wa Tebukuro desu.
これは手袋です。

これはしたぎです。
This is underwear.
kore wa Shitagi desu.
これは下着です。

これはマフラーです。
This is scarf.
kore wa Mafuraa desu.
これはマフラーです。

これはおびです。
This is obi.
kore wa Obi desu.
これは帯です。

これはぞうりです。
This is zori.
kore wa Zouri desu.
これはぞうりです。

これはたびです。
This is tabi.
kore wa Tabi desu.
これはたびです。

これはうわぎです。
This is jacket.
kore wa Uwagi desu.
これは上着です。

これは（オーバー）コートです。
This is overcoat.
kore wa (Oobaa) cooto desu.
これは（オーバー）コートです。

これはストッキングです。
This is tights.
kore wa Sutokkingu desu.
これはストッキングです。

これはワンピースです。
This is one-piece dress.
kore wa Wanpiisu desu.
これはワンピースです。

これはジーンズです。
This is jeans.
kore wa Jiinzu desu.
これはジーンズです。

これはスカートです。
This is skirt.
kore wa Sukaato desu.
これはスカートです。

これはブラウスです。
This is blouse.
kore wa Burausu desu.
これはブラウスです。

これはパンティーです。
This is panties.
kore wa Pantii desu.
これはパンティーです。

これはきものです。
This is kimono.
kore wa Kimono desu.
これは着物です。

これはレインコートです。
This is raincoat.
kore wa Reinkooto desu.
これはレインコートです。

これはネクタイです。
This is tie.
kore wa Nekutai desu.
これはネクタイです。

これはベルトです。
This is belt.
kore wa Beruto desu.
これはベルトです。

これはハイヒールです。
This is high heels.
kore wa Haihiiru desu.
これはハイヒールです。

これはブーツです。
This is boots.
kore wa Buutsu desu.
これはブーツです。

これはパンツです。
This is pants.
kore wa Pantsu desu.
これはパンツです。

これはズボンです。
This is trousers.
kore wa Zubon desu.
これはズボンです。

これはワイシャツです。
This is [white] shirt.
kore wa Waishatsu desu.
これはワイシャツです。

これはうんどうぐつです。
This is trainers.
kore wa Undougutsu desu.
これは運動靴です。

`;

allSentences["Sentence 22 - Hard"] = ``;

allSentences["Sentence 23"] = `
でんきやをさわります。
touch electrician.
denkiya o sawarimasu.
でんきやをさわります。

しんごうをでます。
come out traffic light.
shingou o demasu.
しんごうをでます。

サイズをこしょうします。
fail size.
saizu o koshou shimasu.
サイズをこしょうします。

はしにうごきます。
move bridge.
hashi ni ugokimasu.
はしにうごきます。

さわりますドアににあるきます。
walk touch [a door].
sawarimasu ni arukimasu.
さわりますドアににあるきます。

でますおつりがをひっこしします。
move [change] come out.
demasu o hikkoshi shimasu.
でますおつりがをひっこしします。

こしょうに（せんせいに）ききます。
ask break down.
koshou ni (sensei ni) kikimasu.
こしょうに（せんせいに）ききます。

こうさてんをまわします。
turn crossroad.
kousaten o mawashimasu.
こうさてんをまわします。

ちゅうしゃじょうにひきます。
pull parking lot.
chuushajou ni hikimasu.
ちゅうしゃじょうにひきます。

たてものをかえます。
change building.
tatemono o kaemasu.
たてものをかえます。

がいこくじんとうろくしょうをわたります。
cross alien registration card.
gaikokujin tourokushou o watarimasu.
がいこくじんとうろくしょうをわたります。

これはやです。
This is person of ~ shop.
kore wa ya desu.
これはやです。

これはごちそうさまでしたです。
This is That was delicious..
kore wa gochisousama desu.
これはごちそうさまでしたです。

これはつまみです。
This is knob.
kore wa tsumami desu.
これはつまみです。

これはおしょうがつです。
This is New Year's Day.
kore wa shougatsu desu.
これはおしょうがつです。

これはきをつけてです。
This is pay attention.
kore wa ki o tsukete desu.
これはきをつけてです。

これはきかいです。
This is machine.
kore wa kikai desu.
これはきかいです。

これはおゆです。
This is hot water.
kore wa yu desu.
これはおゆです。

これはみちです。
This is road.
kore wa michi desu.
これはみちです。

これはめです。
This is the ~nth.
kore wa me desu.
これはめです。

これはおとです。
This is sound.
kore wa oto desu.
これはおとです。

これはかどです。
This is corner.
kore wa kado desu.
これはかどです。

これはガソリンスタンドです。
This is petrol station.
kore wa Gasorin sutando desu.
これはガソリンスタンドです。

これはとまれです。
This is Stop.
kore wa Tomare desu.
これは止まれです。

これはどうろです。
This is Roads / Streets.
kore wa douro desu.
これは道路です。

これはほどうです。
This is pavement.
kore wa Hodou desu.
これは歩道です。

これはしゃどうです。
This is road.
kore wa Shadou desu.
これは車道です。

これはこうそくどうろです。
This is motorway.
kore wa Kousokudouro desu.
これは高速道路です。

これはとおりです。
This is street.
kore wa Toori desu.
これは通りです。

これはおうだんほどうです。
This is pedestrian crossing.
kore wa Oudan hodou desu.
これは横断歩道です。

これはほどうきょうです。
This is pedestrian bridge.
kore wa Hodoukyou desu.
これは歩道橋です。

これはさかです。
This is slope.
kore wa Saka desu.
これは坂です。

これはふみきりです。
This is railway crossing.
kore wa Fumikiri desu.
これは踏切です。

これはいっぽうつうこうです。
This is One Way.
kore wa Ippoutsuukou desu.
これは一方通行です。

これはしんにゅうきんしです。
This is No Entry.
kore wa Shinnyuukinshi desu.
これは進入禁止です。

これはちゅうしゃきんしです。
This is No Parking.
kore wa Chuushakinshi desu.
これは駐車禁止です。

これはうせつきんしです。
This is No Right Turn.
kore wa Usetsukinshi desu.
これは右折禁止です。

`;

allSentences["Sentence 23 - Hard"] = ``;

allSentences["Sentence 24"] = `
おじいさん・おじいちゃんをくれます。
give grandfather.
ojiisan / ojiichan o kuremasu.
おじいさん・おじいちゃんをくれます。

おばあさん・おばあちゃんをじゅんびします。
prepare grandmother.
obaasan / obaachan o junbi shimau.
おばあさん・おばあちゃんをじゅんびします。

おかしをしょうかいします。
introduce sweets.
okashi o shoukai shimasu.
おかしをしょうかいします。

ぜんぶにつれていきます。
take all.
zenbu ni tsurete ikimasu.
ぜんぶにつれていきます。

おべんとうにつれてきます。
bring box lunch.
bentou ni tsurete kimasu.
おべんとうにつれてきます。

母のひをあんないします。
show around Mother's Day.
haha no hi o annai shimasu.
母のひをあんないします。

ホームステイをせつめいします。
explain homestay.
hoomusutei o setsumei shimasu.
ホームステイをせつめいします。

いみをいれます。
make meaning.
imi o iremasu.
いみをいれます。

ほかにをおくります。
escort / see besides.
hokani o okurimasu.
ほかにをおくります。

これはじゅんびです。
This is preparation.
kore wa junbi desu.
これはじゅんびです。

これはじぶんでです。
This is by oneself.
kore wa jibun de desu.
これはじぶんでです。

これはワゴンしゃです。
This is station wagon.
kore wa wagon sha desu.
これはワゴンしゃです。

これはにゅうがくいわいです。
This is Gift celebrating admission to school.
kore wa Nyuugakuiwai desu.
これは入学祝いです。

これはそつぎょういわいです。
This is Graduation gift.
kore wa Sotsugyouiwai desu.
これは卒業祝いです。

これはけっこんいわいです。
This is Wedding gift.
kore wa Kekkon'iwai desu.
これは結婚祝いです。

これはぞうとうのしゅうかんです。
This is Exchanging gifts.
kore wa zoutou no shuukan desu.
これは贈答の習慣です。

これはのしぶくろです。
This is Special decorated envelope for money gifts.
kore wa Noshibukuro desu.
これは熨斗袋です。

これはとしだまです。
This is Small gift of money given by parents and relatives to children on New Year’s Day.
kore wa Toshidama desu.
これはお年玉です。

これはしゅっさんいわいです。
This is Gift celebrating a birth.
kore wa Shussaniwai desu.
これは出産祝いです。

これはおちゅうげんです。
This is Gift for a person whose care you are under.
kore wa Ochugen desu.
これはお中元です。

これはおせいぼです。
This is Gift for a person whose care you are under.
kore wa Oseibo desu.
これはお歳暮です。

これはおこうでんです。
This is Condolence money.
kore wa Okouden desu.
これはお香典です。

これはおみまいです。
This is Present given when visiting a sick or injured person.
kore wa Omimai desu.
これはお見舞いです。

`;

allSentences["Sentence 24 - Hard"] = ``;

allSentences["Sentence 25"] = `
いっぱいのみましょう。
Let's have a drink.
ippai nomimashou
いっぱいのみましょう。

こどもはろうじんです。
child is old age.
Kodomo wa Roujin desu.
子どもは老人です。

いなかをりゅうがくします。
study abroad countryside.
inaka o ryuugaku shimasu.
いなかをりゅうがくします。

いろいろおせわになりましたをがんばります。
do one's best Thank you for everything you have done for me.
iroiro osewa ni narimashita o ganbarimasu.
いろいろおせわになりましたをがんばります。

グループをてんきんします。
be transferred to another office group.
guruupu o tenkin shimasu.
グループをてんきんします。

チャンスをかんがえます。
think chance.
chansu o kangaemasu.
チャンスをかんがえます。

たいしかんにつきます。
arrive embassy.
taishikan ni tsukimasu.
たいしかんにつきます。

てんきんをとしをとります。
grow old job transfer / relocation.
tenkin o toshi o torimasu.
てんきんをとしをとります。

おくをうまれます。
be born hundred million.
oku o Umaremasu.
おくを生まれます。

もしたらをがっこうにはいります。
enter school if ~.
moshi ~tara o Gakkou ni hairimasu.
もしたらを学校に入ります。

いくらでも／てもをがっこうをでます。
graduate from school no matter how.
ikura ~ demo / temo o Gakkou o demasu.
いくらでも／てもを学校を出ます。

ことをけっこんします。
get married thing.
koto o Kekkonshimasu.
ことを結婚します。

どうぞおげんきでをこどもがうまれます。
have a child Best of luck.
douzo ogenki de o Kodomo ga umaremasu.
どうぞおげんきでを子どもが生まれます。

あかちゃんをしごとをやめます。
retire baby.
Akachan o Shigoto o yamemasu.
赤ちゃんを仕事をやめます。

しょうがっこうをしゅうしょくします。
get a job primary.
Shougakkou o Shuushokushimasu.
小学校を就職します。

ちゅうがっこうをりこんします。
get divorced lower secondary.
Chuugakkou o Rikonshimasu.
中学校を離婚します。

だいがくをさいこんします。
remarry university.
Daigaku o Saikonshimasu.
大学を再婚します。

ほいくえんをしにます。
die nursery school.
Hoikuen o Shinimasu.
保育園を死にます。

これはようちえんです。
This is kindergarten.
kore wa Youchien desu.
これは幼稚園です。

これはひとのいっしょうです。
This is Life / A person's lifetime.
kore wa hito no isshou desu.
これは人の一生です。

これはせいねんです。
This is youth.
kore wa Seinen desu.
これは青年です。

これはちゅうねんです。
This is middle age.
kore wa Chuunen desu.
これは中年です。

これはこうとうがっこうです。
This is upper secondary.
kore wa Koutougakkou desu.
これは高等学校です。

これはたんだいです。
This is junior college.
kore wa Tandai desu.
これは短大です。

これはせんもんがっこうです。
This is technical college.
kore wa Senmongakkou desu.
これは専門学校です。

これはだいがくいんです。
This is postgraduate course.
kore wa Daigakuin desu.
これは大学院です。

`;

allSentences["Sentence 25 - Hard"] = ``;

if (typeof allWords !== "undefined") {
  Object.assign(allWords, allSentences);
}
