import { doc, getDocFromServer, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { AdSettings } from '../types';

const ADS_COLLECTION = 'system_settings';
const ADS_DOCUMENT = 'ads';

const adsDoc = () => doc(db, ADS_COLLECTION, ADS_DOCUMENT);

export async function fetchAdSettingsFromFirestore(): Promise<AdSettings | null> {
  const snapshot = await getDocFromServer(adsDoc());
  if (!snapshot.exists()) return null;

  const data = snapshot.data() as Partial<AdSettings>;
  const settings: AdSettings = {
    belowSubtitle: typeof data.belowSubtitle === 'string' ? data.belowSubtitle : '',
    inBody: typeof data.inBody === 'string' ? data.inBody : '',
    afterBody: typeof data.afterBody === 'string' ? data.afterBody : '',
    sidebarTop: typeof data.sidebarTop === 'string' ? data.sidebarTop : '',
    sidebarBottom: typeof data.sidebarBottom === 'string' ? data.sidebarBottom : '',
    radioSidebar: typeof data.radioSidebar === 'string' ? data.radioSidebar : '',
    belowSubtitleEnabled: data.belowSubtitleEnabled !== false,
  };

  const hasAdCode = [
    settings.belowSubtitle,
    settings.inBody,
    settings.afterBody,
    settings.sidebarTop,
    settings.sidebarBottom,
    settings.radioSidebar,
  ].some((value) => typeof value === 'string' && value.trim().length > 0);

  return hasAdCode ? settings : null;
}

export async function saveAdSettingsToFirestore(settings: AdSettings): Promise<void> {
  await setDoc(adsDoc(), {
    belowSubtitle: settings.belowSubtitle || '',
    inBody: settings.inBody || '',
    afterBody: settings.afterBody || '',
    sidebarTop: settings.sidebarTop || '',
    sidebarBottom: settings.sidebarBottom || '',
    radioSidebar: settings.radioSidebar || '',
    belowSubtitleEnabled: settings.belowSubtitleEnabled !== false,
    updatedAt: new Date().toISOString(),
  });
}
