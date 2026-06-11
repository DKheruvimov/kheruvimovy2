export interface ScheduleItem {
  time: string;
  event: string;
  desc: string;
  icon: 'Wine' | 'Heart' | 'Utensils' | 'Music';
}

export interface DetailItem {
  title: string;
  content: string;
  icon: 'MapPin' | 'Info' | 'Heart';
}

export interface ImageStyle {
  scale: number;
  rotate: number;
  x: number;
  y: number;
}

export interface SiteContent {
  names: string;
  date: string;
  location: string;
  subLocation: string;
  heroImage: string;
  heroStyle: ImageStyle;
  heroImageMobile?: string;
  heroStyleMobile?: ImageStyle;
  storyTitle: string;
  storySubtitle: string;
  storyDescription: string;
  storyImage: string;
  storyStyle: ImageStyle;
  storyImageMobile?: string;
  storyStyleMobile?: ImageStyle;
  storyQuote: string;
  signature: string;
  schedule: ScheduleItem[];
  details: DetailItem[];
  detailsImage: string;
  detailsStyle: ImageStyle;
  detailsImageMobile?: string;
  detailsStyleMobile?: ImageStyle;
  rsvpDeadline: string;
  footerText: string;
  manorTitle: string;
  colors: {
    primary: string;
    text: string;
    bg: string;
    accent: string;
    hover: string;
    quoteBg: string;
  };
}

export const defaultImageStyle: ImageStyle = {
  scale: 1,
  rotate: 0,
  x: 0,
  y: 0
};

export const defaultContent: SiteContent = {
  names: "Денис & Дарья",
  date: "25 августа 2026",
  location: "Нижний Новгород",
  subLocation: "Усадьба времёнъ Имперiи",
  heroImage: "/images/hero.jpg",
  heroStyle: { ...defaultImageStyle, scale: 1.1 },
  heroImageMobile: "",
  heroStyleMobile: defaultImageStyle,
  storyTitle: "О нашем союзе",
  storySubtitle: "Тихое торжество въ сердце города...",
  storyDescription: "В этот особенный день, после нашей тихой частной росписи, мы будем бесконечно рады разделить праздничный ужин с самыми дорогими сердцу людьми. В исторической атмосфере старого Нижнего, среди родных и близких, мы отметим начало нашей семейной жизни.",
  storyImage: "/images/story.jpg",
  storyStyle: defaultImageStyle,
  storyImageMobile: "",
  storyStyleMobile: defaultImageStyle,
  storyQuote: "«Любовь — это когда две души находят друг друга сквозь века...»",
  signature: "Денис и Дарья Херувимовы",
  schedule: [
    { time: "17:00", event: "Встреча", icon: 'Wine', desc: "Тихий сбор родных и приветственный коктейль в усадебном саду" },
    { time: "18:00", event: "Званый ужин", icon: 'Utensils', desc: "Уютная трапеза и семейное застолье в Большом зале усадьбы" },
    { time: "20:30", event: "Вечерний чай", icon: 'Music', desc: "Душевные разговоры, музыка и чаепитие в старинных традициях" }
  ],
  details: [
    { title: "Географическiя координаты", content: "Нижний Новгород, ул. Короленко, 18. Исторический квартал трех святителей. Усадьба сохранена в первозданных традициях.", icon: 'MapPin' },
    { title: "Праздничный наряд", content: "Просим Вас поддержать классический стиль торжества. Рекомендуемые цвета: золото, олива, кремовый шелк и черный бархат.", icon: 'Info' },
    { title: "О дарах и цветах", content: "Мы будем искренне признательны Вам за поздравления в конвертах, которые помогут нам в организации нашего кругосветного паломничества.", icon: 'Heart' }
  ],
  detailsImage: "/images/details.jpg",
  detailsStyle: defaultImageStyle,
  detailsImageMobile: "",
  detailsStyleMobile: defaultImageStyle,
  rsvpDeadline: "15 мая 2026",
  footerText: "Въ ожиданіи тепла и встрѣчи.",
  manorTitle: "Усадьба времёнъ Имперiи",
  colors: {
    primary: "#b5955a",
    text: "#2d342d",
    bg: "#faf7f0",
    accent: "#b5955a",
    hover: "#2d342d",
    quoteBg: "#2d342d"
  }
};
