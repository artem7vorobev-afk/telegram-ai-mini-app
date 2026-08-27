const translations = {
  ru: {
    // Navigation
    home: 'Главная',
    chat: 'Чат',
    image: 'Картинки',
    audio: 'Аудио',
    video: 'Видео',
    music: 'Музыка',
    wallet: 'Кошелек',
    profile: 'Профиль',
    
    // Home
    allServices: 'Все сервисы',
    textModels: 'Текстовые модели',
    imageModels: 'Генерация картинок',
    audioModels: 'Озвучка',
    videoModels: 'Видео',
    musicModels: 'Музыка',
    
    // Chat
    selectModel: 'Выберите модель',
    sendMessage: 'Отправить сообщение',
    typeMessage: 'Введите сообщение...',
    
    // Wallet
    balance: 'Баланс',
    tokens: 'токенов',
    topup: 'Пополнить',
    history: 'История',
    packages: 'Пакеты токенов',
    
    // Payment
    sbp: 'СБП',
    stars: 'Telegram Stars',
    crypto: 'Криптовалюта',
    
    // Referrals
    referrals: 'Рефералы',
    inviteLink: 'Пригласительная ссылка',
    copyLink: 'Скопировать',
    totalEarned: 'Всего заработано',
    invitedUsers: 'Приглашенные пользователи',
    
    // Profile
    settings: 'Настройки',
    language: 'Язык',
    notifications: 'Уведомления',
    
    // Common
    loading: 'Загрузка...',
    error: 'Ошибка',
    retry: 'Попробовать снова',
    back: 'Назад',
    save: 'Сохранить',
    cancel: 'Отмена',
  },
  en: {
    // Navigation
    home: 'Home',
    chat: 'Chat',
    image: 'Images',
    audio: 'Audio',
    video: 'Video',
    music: 'Music',
    wallet: 'Wallet',
    profile: 'Profile',
    
    // Home
    allServices: 'All Services',
    textModels: 'Text Models',
    imageModels: 'Image Generation',
    audioModels: 'Voice Over',
    videoModels: 'Video',
    musicModels: 'Music',
    
    // Chat
    selectModel: 'Select Model',
    sendMessage: 'Send Message',
    typeMessage: 'Type a message...',
    
    // Wallet
    balance: 'Balance',
    tokens: 'tokens',
    topup: 'Top Up',
    history: 'History',
    packages: 'Token Packages',
    
    // Payment
    sbp: 'SBP',
    stars: 'Telegram Stars',
    crypto: 'Cryptocurrency',
    
    // Referrals
    referrals: 'Referrals',
    inviteLink: 'Invite Link',
    copyLink: 'Copy',
    totalEarned: 'Total Earned',
    invitedUsers: 'Invited Users',
    
    // Profile
    settings: 'Settings',
    language: 'Language',
    notifications: 'Notifications',
    
    // Common
    loading: 'Loading...',
    error: 'Error',
    retry: 'Retry',
    back: 'Back',
    save: 'Save',
    cancel: 'Cancel',
  }
}

export const t = (key: string, lang: string = 'ru'): string => {
  const keys = key.split('.')
  let value: any = translations[lang as keyof typeof translations]
  
  for (const k of keys) {
    value = value?.[k]
  }
  
  return value || key
}
