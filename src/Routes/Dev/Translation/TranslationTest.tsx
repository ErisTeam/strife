import { For, JSX } from 'solid-js';
import { useTrans } from '../../../Translation';

const localesList = {
	Afar: {
		null: 'aa',
		Djibouti: 'aa_DJ',
		Eritrea: 'aa_ER',
		Ethiopia: 'aa_ET',
	},
	Afrikaans: {
		null: 'af',
		Namibia: 'af_NA',
		'South Africa': 'af_ZA',
	},
	Aghem: {
		null: 'agq',
		Cameroon: 'agq_CM',
	},
	Akan: {
		null: 'ak',
		Ghana: 'ak_GH',
	},
	Albanian: {
		null: 'sq',
		Albania: 'sq_AL',
		'North Macedonia': 'sq_MK',
	},
	Alsatian: {
		null: 'gsw',
		France: 'gsw_FR',
		Liechtenstein: 'gsw_LI',
		Switzerland: 'gsw_CH',
	},
	Amharic: {
		null: 'am',
		Ethiopia: 'am_ET',
	},
	Arabic: {
		null: 'ar',
		Algeria: 'ar_DZ',
		Bahrain: 'ar_BH',
		Chad: 'ar_TD',
		Comoros: 'ar_KM',
		Djibouti: 'ar_DJ',
		Egypt: 'ar_EG',
		Eritrea: 'ar_ER',
		Iraq: 'ar_IQ',
		Israel: 'ar_IL',
		Jordan: 'ar_JO',
		Kuwait: 'ar_KW',
		Lebanon: 'ar_LB',
		Libya: 'ar_LY',
		Mauritania: 'ar_MR',
		Morocco: 'ar_MA',
		Oman: 'ar_OM',
		'Palestinian Authority': 'ar_PS',
		Qatar: 'ar_QA',
		'Saudi Arabia': 'ar_SA',
		Somalia: 'ar_SO',
		'South Sudan': 'ar_SS',
		Sudan: 'ar_SD',
		Syria: 'ar_SY',
		Tunisia: 'ar_TN',
		'U.A.E.': 'ar_AE',
		World: 'ar_001',
		Yemen: 'ar_YE',
	},
	Armenian: {
		null: 'hy',
		Armenia: 'hy_AM',
	},
	Assamese: {
		null: 'as',
		India: 'as_IN',
	},
	Asturian: {
		null: 'ast',
		Spain: 'ast_ES',
	},
	Asu: {
		null: 'asa',
		Tanzania: 'asa_TZ',
	},
	'Azerbaijani (Cyrillic)': {
		null: 'az_Cyrl',
		Azerbaijan: 'az_Cyrl_AZ',
	},
	'Azerbaijani (Latin)': {
		null: 'az_Latn',
		Azerbaijan: 'az_Latn_AZ',
	},
	Bafia: {
		null: 'ksf',
		Cameroon: 'ksf_CM',
	},
	Bamanankan: {
		null: 'bm',
	},
	'Bamanankan (Latin)': {
		Mali: 'bm_Latn_ML',
	},
	Bangla: {
		null: 'bn',
		Bangladesh: 'bn_BD',
		India: 'bn_IN',
	},
	Basaa: {
		null: 'bas',
		Cameroon: 'bas_CM',
	},
	Bashkir: {
		null: 'ba',
		Russia: 'ba_RU',
	},
	Basque: {
		null: 'eu',
		Spain: 'eu_ES',
	},
	Belarusian: {
		null: 'be',
		Belarus: 'be_BY',
	},
	Bemba: {
		null: 'bem',
		Zambia: 'bem_ZM',
	},
	Bena: {
		null: 'bez',
		Tanzania: 'bez_TZ',
	},
	Blin: {
		null: 'byn',
		Eritrea: 'byn_ER',
	},
	Bodo: {
		null: 'brx',
		India: 'brx_IN',
	},
	'Bosnian (Cyrillic)': {
		null: 'bs_Cyrl',
		'Bosnia and Herzegovina': 'bs_Cyrl_BA',
	},
	'Bosnian (Latin)': {
		null: 'bs',
		'Bosnia and Herzegovina': 'bs_Latn_BA',
	},
	Breton: {
		null: 'br',
		France: 'br_FR',
	},
	Bulgarian: {
		null: 'bg',
		Bulgaria: 'bg_BG',
	},
	Burmese: {
		null: 'my',
		Myanmar: 'my_MM',
	},
	Catalan: {
		null: 'ca',
		Andorra: 'ca_AD',
		France: 'ca_FR',
		Italy: 'ca_IT',
		Spain: 'ca_ES',
	},
	Cebuano: {
		null: 'ceb',
	},
	'Cebuan (Latin)': {
		null: 'ceb_Latn',
		Philippines: 'ceb_Latn_PH',
	},
	'Central Atlas Tamazight (Latin)': {
		Morocco: 'tzm_Latn_',
	},
	'Central Kurdish': {
		null: 'ku_Arab',
		Iraq: 'ku_Arab_IQ',
	},
	Chakma: {
		null: 'ccp',
		Chakma: 'ccp_Cakm',
		India: 'ccp_Cakm_',
	},
	Chechen: {
		Russia: 'cd_RU',
	},
	Cherokee: {
		null: 'chr_Cher',
		'United States': 'chr_Cher_US',
	},
	Chiga: {
		null: 'cgg',
		Uganda: 'cgg_UG',
	},
	'Chinese (Simplified)': {
		null: 'zh',
		"People's Republic of China": 'zh_CN',
		Singapore: 'zh_SG',
	},
	'Chinese (Traditional)': {
		null: 'zh_Hant',
		'Hong Kong S.A.R.': 'zh_HK',
		'Macao S.A.R.': 'zh_MO',
		Taiwan: 'zh_TW',
	},
	'Church Slavic': {
		Russia: 'cu_RU',
	},
	'Congo Swahili': {
		null: 'swc',
		'Congo DRC': 'swc_CD',
	},
	Cornish: {
		null: 'kw',
		'United Kingdom': 'kw_GB',
	},
	Corsican: {
		null: 'co',
		France: 'co_FR',
	},
	Croatian: {
		null: 'hr,',
		Croatia: 'hr_HR',
	},
	'Croatian (Latin)': {
		'Bosnia and Herzegovina': 'hr_BA',
	},
	Czech: {
		null: 'cs',
		'Czech Republic': 'cs_CZ',
	},
	Danish: {
		null: 'da',
		Denmark: 'da_DK',
		Greenland: 'da_GL',
	},
	Dari: {
		null: 'prs',
		Afghanistan: 'prs_AF',
	},
	Divehi: {
		null: 'dv',
		Maldives: 'dv_MV',
	},
	Duala: {
		null: 'dua',
		Cameroon: 'dua_CM',
	},
	Dutch: {
		null: 'nl',
		Aruba: 'nl_AW',
		Belgium: 'nl_BE',
		'Bonaire, Sint Eustatius and Saba': 'nl_BQ',
		Curaçao: 'nl_CW',
		Netherlands: 'nl_NL',
		'Sint Maarten': 'nl_SX',
		Suriname: 'nl_SR',
	},
	Dzongkha: {
		null: 'dz',
		Bhutan: 'dz_BT',
	},
	Embu: {
		null: 'ebu',
		Kenya: 'ebu_KE',
	},
	English: {
		null: 'en',
		'American Samoa': 'en_AS',
		Anguilla: 'en_AI',
		'Antigua and Barbuda': 'en_AG',
		Australia: 'en_AU',
		Austria: 'en_AT',
		Bahamas: 'en_BS',
		Barbados: 'en_BB',
		Belgium: 'en_BE',
		Belize: 'en_BZ',
		Bermuda: 'en_BM',
		Botswana: 'en_BW',
		'British Indian Ocean Territory': 'en_IO',
		'British Virgin Islands': 'en_VG',
		Burundi: 'en_BI',
		Cameroon: 'en_CM',
		Canada: 'en_CA',
		Caribbean: 'en_029',
		'Cayman Islands': 'en_KY',
		'Christmas Island': 'en_CX',
		'Cocos [Keeling] Islands': 'en_CC',
		'Cook Islands': 'en_CK',
		Cyprus: 'en_CY',
		Denmark: 'en_DK',
		Dominica: 'en_DM',
		Eritrea: 'en_ER',
		Europe: 'en_150',
		'Falkland Islands': 'en_FK',
		Finland: 'en_FI',
		Fiji: 'en_FJ',
		Gambia: 'en_GM',
		Germany: 'en_DE',
		Ghana: 'en_GH',
		Gibraltar: 'en_GI',
		Grenada: 'en_GD',
		Guam: 'en_GU',
		Guernsey: 'en_GG',
		Guyana: 'en_GY',
		'Hong Kong': 'en_HK',
		India: 'en_IN',
		Ireland: 'en_IE',
		'Isle of Man': 'en_IM',
		Israel: 'en_IL',
		Jamaica: 'en_JM',
		Jersey: 'en_JE',
		Kenya: 'en_KE',
		Kiribati: 'en_KI',
		Lesotho: 'en_LS',
		Liberia: 'en_LR',
		'Macao SAR': 'en_MO',
		Madagascar: 'en_MG',
		Malawi: 'en_MW',
		Malaysia: 'en_MY',
		Malta: 'en_MT',
		'Marshall Islands': 'en_MH',
		Mauritius: 'en_MU',
		Micronesia: 'en_FM',
		Montserrat: 'en_MS',
		Namibia: 'en_NA',
		Nauru: 'en_NR',
		Netherlands: 'en_NL',
		'New Zealand': 'en_NZ',
		Nigeria: 'en_NG',
		Niue: 'en_NU',
		'Norfolk Island': 'en_NF',
		'Northern Mariana Islands': 'en_MP',
		Pakistan: 'en_PK',
		Palau: 'en_PW',
		'Papua New Guinea': 'en_PG',
		'Pitcairn Islands': 'en_PN',
		'Puerto Rico': 'en_PR',
		'Republic of the Philippines': 'en_PH',
		Rwanda: 'en_RW',
		'Saint Kitts and Nevis': 'en_KN',
		'Saint Lucia': 'en_LC',
		'Saint Vincent and the Grenadines': 'en_VC',
		Samoa: 'en_WS',
		Seychelles: 'en_SC',
		'Sierra Leone': 'en_SL',
		Singapore: 'en_SG',
		'Sint Maarten': 'en_SX',
		Slovenia: 'en_SI',
		'Solomon Islands': 'en_SB',
		'South Africa': 'en_ZA',
		'South Sudan': 'en_SS',
		'St Helena, Ascension, Tristan da Cunha': 'en_SH',
		Sudan: 'en_SD',
		Swaziland: 'en_SZ',
		Sweden: 'en_SE',
		Switzerland: 'en_CH',
		Tanzania: 'en_TZ',
		Tokelau: 'en_TK',
		Tonga: 'en_TO',
		'Trinidad and Tobago': 'en_TT',
		'Turks and Caicos Islands': 'en_TC',
		Tuvalu: 'en_TV',
		Uganda: 'en_UG',
		'United Arab Emirates': 'en_AE',
		'United Kingdom': 'en_GB',
		'United States': 'en_US',
		'US Minor Outlying Islands': 'en_UM',
		'US Virgin Islands': 'en_VI',
		Vanuatu: 'en_VU',
		World: 'en_001',
		Zambia: 'en_ZM',
		Zimbabwe: 'en_ZW',
	},
	Esperanto: {
		null: 'eo',
		World: 'eo_001',
	},
	Estonian: {
		null: 'et',
		Estonia: 'et_EE',
	},
	Ewe: {
		null: 'ee',
		Ghana: 'ee_GH',
		Togo: 'ee_TG',
	},
	Ewondo: {
		null: 'ewo',
		Cameroon: 'ewo_CM',
	},
	Faroese: {
		null: 'fo',
		Denmark: 'fo_DK',
		'Faroe Islands': 'fo_FO',
	},
	Filipino: {
		null: 'fil',
		Philippines: 'fil_PH',
	},
	Finnish: {
		null: 'fi',
		Finland: 'fi_FI',
	},
	French: {
		null: 'fr',
		Algeria: 'fr_DZ',
		Belgium: 'fr_BE',
		Benin: 'fr_BJ',
		'Burkina Faso': 'fr_BF',
		Burundi: 'fr_BI',
		Cameroon: 'fr_CM',
		Canada: 'fr_CA',
		'Central African Republic': 'fr_CF',
		Chad: 'fr_TD',
		Comoros: 'fr_KM',
		Congo: 'fr_CG',
		'Congo, DRC': 'fr_CD',
		"Côte d'Ivoire": 'fr_CI',
		Djibouti: 'fr_DJ',
		'Equatorial Guinea': 'fr_GQ',
		France: 'fr_FR',
		'French Guiana': 'fr_GF',
		'French Polynesia': 'fr_PF',
		Gabon: 'fr_GA',
		Guadeloupe: 'fr_GP',
		Guinea: 'fr_GN',
		Haiti: 'fr_HT',
		Luxembourg: 'fr_LU',
		Madagascar: 'fr_MG',
		Mali: 'fr_ML',
		Martinique: 'fr_MQ',
		Mauritania: 'fr_MR',
		Mauritius: 'fr_MU',
		Mayotte: 'fr_YT',
		Morocco: 'fr_MA',
		'New Caledonia': 'fr_NC',
		Niger: 'fr_NE',
		'Principality of Monaco': 'fr_MC',
		Reunion: 'fr_RE',
		Rwanda: 'fr_RW',
		'Saint Barthélemy': 'fr_BL',
		'Saint Martin': 'fr_MF',
		'Saint Pierre and Miquelon': 'fr_PM',
		Senegal: 'fr_SN',
		Seychelles: 'fr_SC',
		Switzerland: 'fr_CH',
		Syria: 'fr_SY',
		Togo: 'fr_TG',
		Tunisia: 'fr_TN',
		Vanuatu: 'fr_VU',
		'Wallis and Futuna': 'fr_WF',
	},
	Frisian: {
		null: 'fy',
		Netherlands: 'fy_NL',
	},
	Friulian: {
		null: 'fur',
		Italy: 'fur_IT',
	},
	Fulah: {
		null: 'ff',
		Cameroon: 'ff_CM',
		Guinea: 'ff_GN',
		Mauritania: 'ff_MR',
		Nigeria: 'ff_NG',
		Senegal: 'ff_Latn_SN',
	},
	'Fulah (Latin)': {
		null: 'ff_Latn',
		'Burkina Faso': 'ff_Latn_BF',
		Cameroon: 'ff_Latn_CM',
		Gambia: 'ff_Latn_GM',
		Ghana: 'ff_Latn_GH',
		Guinea: 'ff_Latn_GN',
		Guinea_Bissau: 'ff_Latn_GW',
		Liberia: 'ff_Latn_LR',
		Mauritania: 'ff_Latn_MR',
		Niger: 'ff_Latn_NE',
		Nigeria: 'ff_Latn_NG',
		'Sierra Leone': 'ff_Latn_SL',
	},
	Galician: {
		null: 'gl',
		Spain: 'gl_ES',
	},
	Ganda: {
		null: 'lg',
		Uganda: 'lg_UG',
	},
	Georgian: {
		null: 'ka',
		Georgia: 'ka_GE',
	},
	German: {
		null: 'de',
		Austria: 'de_AT',
		Belgium: 'de_BE',
		Germany: 'de_DE',
		Italy: 'de_IT',
		Liechtenstein: 'de_LI',
		Luxembourg: 'de_LU',
		Switzerland: 'de_CH',
	},
	Greek: {
		null: 'el',
		Cyprus: 'el_CY',
		Greece: 'el_GR',
	},
	Greenlandic: {
		null: 'kl',
		Greenland: 'kl_GL',
	},
	Guarani: {
		null: 'gn',
		Paraguay: 'gn_PY',
	},
	Gujarati: {
		null: 'gu',
		India: 'gu_IN',
	},
	Gusii: {
		null: 'guz',
		Kenya: 'guz_KE',
	},
	'Hausa (Latin)': {
		null: 'ha_Latn',
		Ghana: 'ha_Latn_GH',
		Niger: 'ha_Latn_NE',
		Nigeria: 'ha_Latn_NG',
	},
	Hawaiian: {
		null: 'haw',
		'United States': 'haw_US',
	},
	Hebrew: {
		null: 'he',
		Israel: 'he_IL',
	},
	Hindi: {
		null: 'hi',
		India: 'hi_IN',
	},
	Hungarian: {
		null: 'hu',
		Hungary: 'hu_HU',
	},
	Icelandic: {
		null: 'is',
		Iceland: 'is_IS',
	},
	Igbo: {
		null: 'ig',
		Nigeria: 'ig_NG',
	},
	Indonesian: {
		null: 'id',
		Indonesia: 'id_ID',
	},
	Interlingua: {
		null: 'ia',
		France: 'ia_FR',
		World: 'ia_001',
	},
	'Inuktitut (Latin)': {
		null: 'iu_Latn',
		Canada: 'iu_Latn_CA',
	},
	'Inuktitut (Syllabics)': {
		null: 'iu_Cans',
		Canada: 'iu_Cans_CA',
	},
	Irish: {
		null: 'ga',
		Ireland: 'ga_IE',
	},
	Italian: {
		null: 'it',
		Italy: 'it_IT',
		'San Marino': 'it_SM',
		Switzerland: 'it_CH',
		'Vatican City': 'it_VA',
	},
	Japanese: {
		null: 'ja',
		Japan: 'ja_JP',
	},
	Javanese: {
		null: 'jv',
		Latin: 'jv_Latn',
		'Latin, Indonesia': 'jv_Latn_ID',
	},
	Jola_Fonyi: {
		null: 'dyo',
		Senegal: 'dyo_SN',
	},
	Kabuverdianu: {
		null: 'kea',
		'Cabo Verde': 'kea_CV',
	},
	Kabyle: {
		null: 'kab',
		Algeria: 'kab_DZ',
	},
	Kako: {
		null: 'kkj',
		Cameroon: 'kkj_CM',
	},
	Kalenjin: {
		null: 'kln',
		Kenya: 'kln_KE',
	},
	Kamba: {
		null: 'kam',
		Kenya: 'kam_KE',
	},
	Kannada: {
		null: 'kn',
		India: 'kn_IN',
	},
	Kashmiri: {
		null: 'ks',
		Perso_Arabic: 'ks_Arab_IN',
	},
	Kazakh: {
		null: 'kk',
		Kazakhstan: 'kk_KZ',
	},
	Khmer: {
		null: 'km',
		Cambodia: 'km_KH',
	},
	"K'iche": {
		null: 'quc',
		Guatemala: 'quc_Latn_GT',
	},
	Kikuyu: {
		null: 'ki',
		Kenya: 'ki_KE',
	},
	Kinyarwanda: {
		null: 'rw',
		Rwanda: 'rw_RW',
	},
	Kiswahili: {
		null: 'sw',
		Kenya: 'sw_KE',
		Tanzania: 'sw_TZ',
		Uganda: 'sw_UG',
	},
	Konkani: {
		null: 'kok',
		India: 'kok_IN',
	},
	Korean: {
		null: 'ko',
		Korea: 'ko_KR',
		'North Korea': 'ko_KP',
	},
	'Koyra Chiini': {
		null: 'khq',
		Mali: 'khq_ML',
	},
	'Koyraboro Senni': {
		null: 'ses',
		Mali: 'ses_ML',
	},
	Kwasio: {
		null: 'nmg',
		Cameroon: 'nmg_CM',
	},
	Kyrgyz: {
		null: 'ky',
		Kyrgyzstan: 'ky_KG',
	},
	Kurdish: {
		'Perso_Arabic, Iran': 'ku_Arab_IR',
	},
	Lakota: {
		null: 'lkt',
		'United States': 'lkt_US',
	},
	Langi: {
		null: 'lag',
		Tanzania: 'lag_TZ',
	},
	Lao: {
		null: 'lo',
		'Lao P.D.R.': 'lo_LA',
	},
	Latvian: {
		null: 'lv',
		Latvia: 'lv_LV',
	},
	Lingala: {
		null: 'ln',
		Angola: 'ln_AO',
		'Central African Republic': 'ln_CF',
		Congo: 'ln_CG',
		'Congo DRC': 'ln_CD',
	},
	Lithuanian: {
		null: 'lt',
		Lithuania: 'lt_LT',
	},
	'Low German': {
		null: 'nds',
		Germany: 'nds_DE',
		Netherlands: 'nds_NL',
	},
	'Lower Sorbian': {
		null: 'dsb',
		Germany: 'dsb_DE',
	},
	Luba_Katanga: {
		null: 'lu',
		'Congo DRC': 'lu_CD',
	},
	Luo: {
		null: 'luo',
		Kenya: 'luo_KE',
	},
	Luxembourgish: {
		null: 'lb',
		Luxembourg: 'lb_LU',
	},
	Luyia: {
		null: 'luy',
		Kenya: 'luy_KE',
	},
	Macedonian: {
		null: 'mk',
		'North Macedonia': 'mk_MK',
	},
	Machame: {
		null: 'jmc',
		Tanzania: 'jmc_TZ',
	},
	Makhuwa_Meetto: {
		null: 'mgh',
		Mozambique: 'mgh_MZ',
	},
	Makonde: {
		null: 'kde',
		Tanzania: 'kde_TZ',
	},
	Malagasy: {
		null: 'mg',
		Madagascar: 'mg_MG',
	},
	Malay: {
		null: 'ms',
		'Brunei Darussalam': 'ms_BN',
		Malaysia: 'ms_MY',
	},
	Malayalam: {
		null: 'ml',
		India: 'ml_IN',
	},
	Maltese: {
		null: 'mt',
		Malta: 'mt_MT',
	},
	Manx: {
		null: 'gv',
		'Isle of Man': 'gv_IM',
	},
	Maori: {
		null: 'mi',
		'New Zealand': 'mi_NZ',
	},
	Mapudungun: {
		null: 'arn',
		Chile: 'arn_CL',
	},
	Marathi: {
		null: 'mr',
		India: 'mr_IN',
	},
	Masai: {
		null: 'mas',
		Kenya: 'mas_KE',
		Tanzania: 'mas_TZ',
	},
	Mazanderani: {
		Iran: 'mzn_IR',
	},
	Meru: {
		null: 'mer',
		Kenya: 'mer_KE',
	},
	"Meta'": {
		null: 'mgo',
		Cameroon: 'mgo_CM',
	},
	Mohawk: {
		null: 'moh',
		Canada: 'moh_CA',
	},
	'Mongolian (Cyrillic)': {
		null: 'mn_Cyrl',
		Mongolia: 'mn_MN',
	},
	'Mongolian (Traditional Mongolian)': {
		null: 'mn_Mong',
		"People's Republic of China": 'mn_Mong_CN',
		Mongolia: 'mn_Mong_MN',
	},
	Morisyen: {
		null: 'mfe',
		Mauritius: 'mfe_MU',
	},
	Mundang: {
		null: 'mua',
		Cameroon: 'mua_CM',
	},
	"N'ko": {
		null: 'nqo',
		Guinea: 'nqo_GN',
	},
	Nama: {
		null: 'naq',
		Namibia: 'naq_NA',
	},
	Nepali: {
		null: 'ne',
		India: 'ne_IN',
		Nepal: 'ne_NP',
	},
	Ngiemboon: {
		null: 'nnh',
		Cameroon: 'nnh_CM',
	},
	Ngomba: {
		null: 'jgo',
		Cameroon: 'jgo_CM',
	},
	'Northern Luri': {
		Iraq: 'lrc_IQ',
		Iran: 'lrc_IR',
	},
	'North Ndebele': {
		null: 'nd',
		Zimbabwe: 'nd_ZW',
	},
	'Norwegian (Bokmal)': {
		null: 'nb',
		Norway: 'nb_NO',
	},
	'Norwegian (Nynorsk)': {
		null: 'nn',
		Norway: 'nn_NO',
	},
	'Norwegian Bokmål': {
		'Svalbard and Jan Mayen': 'nb_SJ',
	},
	Nuer: {
		null: 'nus',
		Sudan: 'nus_SD',
		'South Sudan': 'nus_SS',
	},
	Nyankole: {
		null: 'nyn',
		Uganda: 'nyn_UG',
	},
	Occitan: {
		null: 'oc',
		France: 'oc_FR',
	},
	Odia: {
		null: 'or',
		India: 'or_IN',
	},
	Oromo: {
		null: 'om',
		Ethiopia: 'om_ET',
		Kenya: 'om_KE',
	},
	Ossetian: {
		null: 'os',
		'Cyrillic, Georgia': 'os_GE',
		'Cyrillic, Russia': 'os_RU',
	},
	Pashto: {
		null: 'ps',
		Afghanistan: 'ps_AF',
		Pakistan: 'ps_PK',
	},
	Persian: {
		null: 'fa',
		Afghanistan: 'fa_AF',
		Iran: 'fa_IR',
	},
	Polish: {
		null: 'pl',
		Poland: 'pl_PL',
	},
	Portuguese: {
		null: 'pt',
		Angola: 'pt_AO',
		Brazil: 'pt_BR',
		'Cabo Verde': 'pt_CV',
		'Equatorial Guinea': 'pt_GQ',
		Guinea_Bissau: 'pt_GW',
		Luxembourg: 'pt_LU',
		'Macao SAR': 'pt_MO',
		Mozambique: 'pt_MZ',
		Portugal: 'pt_PT',
		'São Tomé and Príncipe': 'pt_ST',
		Switzerland: 'pt_CH',
		Timor_Leste: 'pt_TL',
	},
	Prussian: {
		null: 'prg_001',
	},
	'Pseudo Language': {
		'Pseudo locale for east Asian/complex script localization testing': 'qps_ploca',
		'Pseudo locale used for localization testing': 'qps_ploc',
		'Pseudo locale used for localization testing of mirrored locales': 'qps_plocm',
	},
	Punjabi: {
		null: 'pa_Arab',
		India: 'pa_IN',
		'Islamic Republic of Pakistan': 'pa_Arab_PK',
	},
	Quechua: {
		null: 'quz',
		Bolivia: 'quz_BO',
		Ecuador: 'quz_EC',
		Peru: 'quz_PE',
	},
	Ripuarian: {
		null: 'ksh',
		Germany: 'ksh_DE',
	},
	Romanian: {
		null: 'ro',
		Moldova: 'ro_MD',
		Romania: 'ro_RO',
	},
	Romansh: {
		null: 'rm',
		Switzerland: 'rm_CH',
	},
	Rombo: {
		null: 'rof',
		Tanzania: 'rof_TZ',
	},
	Rundi: {
		null: 'rn',
		Burundi: 'rn_BI',
	},
	Russian: {
		null: 'ru',
		Belarus: 'ru_BY',
		Kazakhstan: 'ru_KZ',
		Kyrgyzstan: 'ru_KG',
		Moldova: 'ru_MD',
		Russia: 'ru_RU',
		Ukraine: 'ru_UA',
	},
	Rwa: {
		null: 'rwk',
		Tanzania: 'rwk_TZ',
	},
	Saho: {
		null: 'ssy',
		Eritrea: 'ssy_ER',
	},
	Sakha: {
		null: 'sah',
		Russia: 'sah_RU',
	},
	Samburu: {
		null: 'saq',
		Kenya: 'saq_KE',
	},
	'Sami (Inari)': {
		null: 'smn',
		Finland: 'smn_FI',
	},
	'Sami (Lule)': {
		null: 'smj',
		Norway: 'smj_NO',
		Sweden: 'smj_SE',
	},
	'Sami (Northern)': {
		null: 'se',
		Finland: 'se_FI',
		Norway: 'se_NO',
		Sweden: 'se_SE',
	},
	'Sami (Skolt)': {
		null: 'sms',
		Finland: 'sms_FI',
	},
	'Sami (Southern)': {
		null: 'sma',
		Norway: 'sma_NO',
		Sweden: 'sma_SE',
	},
	Sango: {
		null: 'sg',
		'Central African Republic': 'sg_CF',
	},
	Sangu: {
		null: 'sbp',
		Tanzania: 'sbp_TZ',
	},
	Sanskrit: {
		null: 'sa',
		India: 'sa_IN',
	},
	'Scottish Gaelic': {
		null: 'gd',
		'United Kingdom': 'gd_GB',
	},
	Sena: {
		null: 'seh',
		Mozambique: 'seh_MZ',
	},
	'Serbian (Cyrillic)': {
		null: 'sr_Cyrl',
		'Bosnia and Herzegovina': 'sr_Cyrl_BA',
		Montenegro: 'sr_Cyrl_ME',
		Serbia: 'sr_Cyrl_RS',
		'Serbia and Montenegro (Former)': 'sr_Cyrl_CS',
	},
	'Serbian (Latin)': {
		null: 'sr',
		'Bosnia and Herzegovina': 'sr_Latn_BA',
		Montenegro: 'sr_Latn_ME',
		Serbia: 'sr_Latn_RS',
		'Serbia and Montenegro (Former)': 'sr_Latn_CS',
	},
	'Sesotho sa Leboa': {
		null: 'nso',
		'South Africa': 'nso_ZA',
	},
	Setswana: {
		null: 'tn',
		Botswana: 'tn_BW',
		'South Africa': 'tn_ZA',
	},
	Shambala: {
		null: 'ksb',
		Tanzania: 'ksb_TZ',
	},
	Shona: {
		null: 'sn',
		Latin: 'sn_Latn',
		Zimbabwe: 'sn_Latn_ZW',
	},
	Sindhi: {
		null: 'sd_Arab',
		'Islamic Republic of Pakistan': 'sd_Arab_PK',
	},
	Sinhala: {
		null: 'si',
		'Sri Lanka': 'si_LK',
	},
	Slovak: {
		null: 'sk',
		Slovakia: 'sk_SK',
	},
	Slovenian: {
		null: 'sl',
		Slovenia: 'sl_SI',
	},
	Soga: {
		null: 'xog',
		Uganda: 'xog_UG',
	},
	Somali: {
		null: 'so',
		Djibouti: 'so_DJ',
		Ethiopia: 'so_ET',
		Kenya: 'so_KE',
		Somalia: 'so_SO',
	},
	Sotho: {
		null: 'st',
		'South Africa': 'st_ZA',
	},
	'South Ndebele': {
		null: 'nr',
		'South Africa': 'nr_ZA',
	},
	'Southern Sotho': {
		Lesotho: 'st_LS',
	},
	Spanish: {
		null: 'es',
		Argentina: 'es_AR',
		Belize: 'es_BZ',
		'Bolivarian Republic of Venezuela': 'es_VE',
		Bolivia: 'es_BO',
		Brazil: 'es_BR',
		Chile: 'es_CL',
		Colombia: 'es_CO',
		'Costa Rica': 'es_CR',
		Cuba: 'es_CU',
		'Dominican Republic': 'es_DO',
		Ecuador: 'es_EC',
		'El Salvador': 'es_SV',
		'Equatorial Guinea': 'es_GQ',
		Guatemala: 'es_GT',
		Honduras: 'es_HN',
		'Latin America': 'es_419',
		Mexico: 'es_MX',
		Nicaragua: 'es_NI',
		Panama: 'es_PA',
		Paraguay: 'es_PY',
		Peru: 'es_PE',
		Philippines: 'es_PH',
		'Puerto Rico': 'es_PR',
		Spain: 'es_ES',
		UnitedStates: 'es_US',
		Uruguay: 'es_UY',
	},
	'Standard Moroccan Tamazight': {
		null: 'zgh',
		Morocco: 'zgh_Tfng_MA',
		Tifinagh: 'zgh_Tfng',
	},
	Swati: {
		null: 'ss',
		'South Africa': 'ss_ZA',
		Swaziland: 'ss_SZ',
	},
	Swedish: {
		null: 'sv',
		'Åland Islands': 'sv_AX',
		Finland: 'sv_FI',
		Sweden: 'sv_SE',
	},
	Syriac: {
		null: 'syr',
		Syria: 'syr_SY',
	},
	Tachelhit: {
		null: 'shi',
		Tifinagh: 'shi_Tfng',
		'Tifinagh, Morocco': 'shi_Tfng_MA',
	},
	'Tachelhit (Latin)': {
		null: 'shi_Latn',
		Morocco: 'shi_Latn_MA',
	},
	Taita: {
		null: 'dav',
		Kenya: 'dav_KE',
	},
	'Tajik (Cyrillic)': {
		null: 'tg_Cyrl',
		Tajikistan: 'tg_Cyrl_TJ',
	},
	'Tamazight (Latin)': {
		null: 'tzm_Latn',
		Algeria: 'tzm_Latn_DZ',
	},
	Tamil: {
		null: 'ta',
		India: 'ta_IN',
		Malaysia: 'ta_MY',
		Singapore: 'ta_SG',
		'Sri Lanka': 'ta_LK',
	},
	Tasawaq: {
		null: 'twq',
		Niger: 'twq_NE',
	},
	Tatar: {
		null: 'tt',
		Russia: 'tt_RU',
	},
	Telugu: {
		null: 'te',
		India: 'te_IN',
	},
	Teso: {
		null: 'teo',
		Kenya: 'teo_KE',
		Uganda: 'teo_UG',
	},
	Thai: {
		null: 'th',
		Thailand: 'th_TH',
	},
	Tibetan: {
		null: 'bo',
		India: 'bo_IN',
		"People's Republic of China": 'bo_CN',
	},
	Tigre: {
		null: 'tig',
		Eritrea: 'tig_ER',
	},
	Tigrinya: {
		null: 'ti',
		Eritrea: 'ti_ER',
		Ethiopia: 'ti_ET',
	},
	Tongan: {
		null: 'to',
		Tonga: 'to_TO',
	},
	Tsonga: {
		null: 'ts',
		'South Africa': 'ts_ZA',
	},
	Turkish: {
		null: 'tr',
		Cyprus: 'tr_CY',
		Turkey: 'tr_TR',
	},
	Turkmen: {
		null: 'tk',
		Turkmenistan: 'tk_TM',
	},
	Ukrainian: {
		null: 'uk',
		Ukraine: 'uk_UA',
	},
	'Upper Sorbian': {
		null: 'hsb',
		Germany: 'hsb_DE',
	},
	Urdu: {
		null: 'ur',
		India: 'ur_IN',
		'Islamic Republic of Pakistan': 'ur_PK',
	},
	Uyghur: {
		null: 'ug',
		"People's Republic of China": 'ug_CN',
	},
	Uzbek: {
		Perso_Arabic: 'uz_Arab',
		'Perso_Arabic, Afghanistan': 'uz_Arab_AF',
	},
	'Uzbek (Cyrillic)': {
		null: 'uz_Cyrl',
		Uzbekistan: 'uz_Cyrl_UZ',
	},
	'Uzbek (Latin)': {
		null: 'uz_Latn',
		Uzbekistan: 'uz_Latn_UZ',
	},
	Vai: {
		null: 'vai_Vaii',
		Liberia: 'vai_Vaii_LR',
	},
	'Vai (Latin)': {
		Liberia: 'vai_Latn_LR',
		null: 'vai_Latn',
	},
	Valencian: {
		Spain: 'ca_ES_',
	},
	Venda: {
		null: 've',
	},
};

import style from './TranslationTest.module.css';
import inputs from '../../../Styles/Inputs.module.css';

export default () => {
	const [t, { locale, setLocale, getDictionary }] = useTrans();

	function a(objects: Object[]) {
		const divs: JSX.Element[] = [];
		Object.keys(objects).forEach((key: string) => {
			// @ts-ignore
			if (typeof objects[key] == 'object') {
				// @ts-ignore
				divs.push(<ol>{...a(objects[key])}</ol>);
			} else {
				divs.push(
					<li>
						{key}:&nbsp;
						{
							// @ts-ignore
							objects[key]('test')
						}
					</li>
				);
			}
		});
		return divs;
	}

	return (
		<div>
			<div>
				<h2>Controls</h2>

				<input
					class={inputs.default}
					type="text"
					list="locales"
					value={locale()}
					oninput={(e) => {
						console.log(e.currentTarget.value);
						// @ts-ignore
						setLocale(e.currentTarget.value);
					}}
				/>
				<datalist id="locales" class={style.datalist}>
					<For each={Object.keys(localesList)}>
						{(key) => {
							const ret = [];
							// @ts-ignore
							for (const locale in localesList[key]) {
								// @ts-ignore
								const l = localesList[key][locale];
								const localeName = locale == 'null' ? key : `${key} (${locale})`;
								ret.push(<option value={l} label={localeName} />);
							}
							return ret;
						}}
					</For>
				</datalist>
			</div>
			<ol>
				<For each={Object.keys(getDictionary() || {})} fallback={<h1>Not found</h1>}>
					{(key) => {
						// @ts-ignore
						if (typeof t[key] == 'object') {
							// @ts-ignore
							return <ul>{key}:&nbsp;{...a(t[key])}</ul>;
						} else {
							return (
								<li>
									{key}:&nbsp;
									{
										// @ts-ignore
										t[key]('test')
									}
								</li>
							);
						}
					}}
				</For>
			</ol>
		</div>
	);
};
