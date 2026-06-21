import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Tag } from 'lucide-react';
import { db } from '../lib/db';
import { useLanguage } from '../contexts/LanguageContext';
import type { BlogPost } from '../types';

function getL(item: any, field: string, lang: string): string {
  if (lang === 'ar') return item[field + 'Ar'] || item[field] || '';
  if (lang === 'so') return item[field + 'So'] || item[field] || '';
  return item[field] || '';
}

export function BlogList() {
  const { t, lang } = useLanguage();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [search, setSearch] = useState('');

  const loadPosts = () => setPosts(db.query<BlogPost>('blog', { published: true }, { field: 'createdAt', direction: 'desc' }));
  useEffect(() => { loadPosts(); return db.subscribe('blog', loadPosts); }, []);

  const filtered = posts.filter(p =>
    getL(p, 'title', lang).toLowerCase().includes(search.toLowerCase()) ||
    getL(p, 'excerpt', lang).toLowerCase().includes(search.toLowerCase())
  );

  if (posts.length === 0) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center px-4">
        <div className="text-center">
          <span className="text-5xl mb-4 block">📝</span>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{t('nav.blog', 'Blog')}</h1>
          <p className="text-gray-500 dark:text-gray-400">{t('common.noData', 'No data available')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-6 text-center">
        {t('nav.blog', 'Blog')}
      </h1>

      <div className="max-w-md mx-auto mb-8">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder={t('common.search', 'Search') + '...'}
          className="input-field"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(post => (
          <Link key={post.id} to={`/blog/${post.id}`} className="card group hover:shadow-lg transition-all">
            {post.image && (
              <div className="aspect-video bg-gray-100 dark:bg-gray-800">
                <img src={post.image} alt={getL(post, 'title', lang)} className="w-full h-full object-cover" />
              </div>
            )}
            <div className="p-5">
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-2">
                <Calendar className="w-3 h-3" />
                {new Date(post.createdAt).toLocaleDateString()}
                {post.author && <span>· {post.author}</span>}
              </div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 transition-colors mb-2">
                {getL(post, 'title', lang)}
              </h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm line-clamp-3">
                {getL(post, 'excerpt', lang)}
              </p>
              {post.tags?.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-3">
                  {post.tags.map((tag, i) => (
                    <span key={i} className="badge bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                      <Tag className="w-2.5 h-2.5 mr-1" />{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export function BlogDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, lang } = useLanguage();
  const [post, setPost] = useState<BlogPost | null>(null);

  const loadPost = () => { if (id) setPost(db.getById<BlogPost>('blog', id)); };
  useEffect(() => { loadPost(); return db.subscribe('blog', loadPost); }, [id]);

  if (!post) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <p className="text-gray-500">{t('common.noData', 'Not found')}</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-gray-500 hover:text-gray-900 dark:hover:text-white mb-6 text-sm">
        <ArrowLeft className="w-4 h-4" /> {t('common.back', 'Back')}
      </button>

      {post.image && (
        <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden mb-6">
          <img src={post.image} alt={getL(post, 'title', lang)} className="w-full h-full object-cover" />
        </div>
      )}

      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-3">
        <Calendar className="w-4 h-4" />
        {new Date(post.createdAt).toLocaleDateString()}
        {post.author && <span>· {post.author}</span>}
      </div>

      <h1 className="text-2xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
        {getL(post, 'title', lang)}
      </h1>

      <div className="prose dark:prose-invert max-w-none text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-line">
        {getL(post, 'content', lang)}
      </div>

      {post.tags?.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-8 pt-6 border-t dark:border-gray-700">
          {post.tags.map((tag, i) => (
            <span key={i} className="badge bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400 px-3 py-1">
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
