import { collection, doc, getDocs, setDoc } from 'firebase/firestore';
import { db } from './firebase';
import { Article } from './types';

export async function loadArticles(): Promise<Article[]> {
  const snapshot = await getDocs(collection(db, 'articles'));
  return snapshot.docs
    .map((item) => ({ ...(item.data() as Article), id: String(item.data().articleId || item.id) }))
    .sort((a, b) => String(b.publishedAt || '').localeCompare(String(a.publishedAt || '')));
}

export async function saveArticle(article: Article): Promise<void> {
  const clean = JSON.parse(JSON.stringify(article));
  await setDoc(doc(db, 'articles', article.id), { ...clean, articleId: article.id });
}
