-- Spiritual Library Supabase schema
-- Run this in the Supabase SQL editor for project pwumovscevwxscasdyuf.

create table if not exists public.books (
  id text primary key,
  title text not null,
  author text not null,
  genre text not null,
  year integer not null,
  pages integer not null,
  rating numeric(2, 1) not null,
  description text not null,
  cover text not null,
  accent text not null,
  reader_url text,
  sort_order integer not null default 0
);

alter table public.books add column if not exists reader_url text;

create table if not exists public.saved_books (
  device_id text not null,
  book_id text not null references public.books(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (device_id, book_id)
);

create table if not exists public.reading_progress (
  device_id text not null,
  book_id text not null references public.books(id) on delete cascade,
  progress integer not null default 0 check (progress >= 0 and progress <= 100),
  updated_at timestamptz not null default now(),
  primary key (device_id, book_id)
);

alter table public.books enable row level security;
alter table public.saved_books enable row level security;
alter table public.reading_progress enable row level security;

drop policy if exists "Public books are readable" on public.books;
create policy "Public books are readable"
  on public.books
  for select
  using (true);

drop policy if exists "Anonymous saved shelf access" on public.saved_books;
create policy "Anonymous saved shelf access"
  on public.saved_books
  for all
  using (true)
  with check (true);

drop policy if exists "Anonymous reading progress access" on public.reading_progress;
create policy "Anonymous reading progress access"
  on public.reading_progress
  for all
  using (true)
  with check (true);

-- Keep only the books intentionally added to the library.
delete from public.reading_progress where book_id not in ('ponder-on-this', 'the-shape-of-things-to-come', 'hp-blavatsky-the-light-bringer', 'mahatma-letters', 'thought-forms', 'wisdom-of-the-heavens', 'the-divine-plan', 'shape-of-things-study-companion', 'the-ocean-of-theosophy', 'the-ancient-wisdom', 'man-visible-and-invisible', 'the-secret-teachings-of-all-ages', 'the-inner-life', 'secret-doctrine-vol-1', 'secret-doctrine-vol-2', 'secret-doctrine-vol-3', 'clairvoyance', 'isis-unveiled', 'the-key-to-theosophy', 'the-voice-of-the-silence', 'the-hidden-side-of-things', 'collected-fruits-of-occult-teaching', 'in-the-outer-court', 'letters-that-have-helped-me', 'power-of-now', 'a-new-earth');
delete from public.saved_books where book_id not in ('ponder-on-this', 'the-shape-of-things-to-come', 'hp-blavatsky-the-light-bringer', 'mahatma-letters', 'thought-forms', 'wisdom-of-the-heavens', 'the-divine-plan', 'shape-of-things-study-companion', 'the-ocean-of-theosophy', 'the-ancient-wisdom', 'man-visible-and-invisible', 'the-secret-teachings-of-all-ages', 'the-inner-life', 'secret-doctrine-vol-1', 'secret-doctrine-vol-2', 'secret-doctrine-vol-3', 'clairvoyance', 'isis-unveiled', 'the-key-to-theosophy', 'the-voice-of-the-silence', 'the-hidden-side-of-things', 'collected-fruits-of-occult-teaching', 'in-the-outer-court', 'letters-that-have-helped-me', 'power-of-now', 'a-new-earth');
delete from public.books where id not in ('ponder-on-this', 'the-shape-of-things-to-come', 'hp-blavatsky-the-light-bringer', 'mahatma-letters', 'thought-forms', 'wisdom-of-the-heavens', 'the-divine-plan', 'shape-of-things-study-companion', 'the-ocean-of-theosophy', 'the-ancient-wisdom', 'man-visible-and-invisible', 'the-secret-teachings-of-all-ages', 'the-inner-life', 'secret-doctrine-vol-1', 'secret-doctrine-vol-2', 'secret-doctrine-vol-3', 'clairvoyance', 'isis-unveiled', 'the-key-to-theosophy', 'the-voice-of-the-silence', 'the-hidden-side-of-things', 'collected-fruits-of-occult-teaching', 'in-the-outer-court', 'letters-that-have-helped-me', 'power-of-now', 'a-new-earth');

insert into public.books (id, title, author, genre, year, pages, rating, description, cover, accent, reader_url, sort_order) values
('ponder-on-this', 'Ponder on This', 'Alice A. Bailey & The Tibetan', 'Spirituality', 1950, 544, 4.9, 'A compilation from the writings of Alice A. Bailey and the Tibetan Master Djwhal Khul on discipleship, meditation, service, and the spiritual path.', 'linear-gradient(145deg, #123c3c 0%, #4a8585 52%, #d9f0ee 100%)', '#4a8585', '/ponder-on-this.html', 1),
('the-shape-of-things-to-come', 'The Shape of Things to Come', 'H. G. Wells', 'Fiction', 1933, 5, 4.6, 'H. G. Wells’ future-history framed as Dr. Philip Raven’s dream book, tracing the collapse of the old order and the emergence of a world state.', 'linear-gradient(145deg, #111827 0%, #334155 48%, #93c5fd 100%)', '#93c5fd', '/the-shape-of-things-to-come.html', 2),
('hp-blavatsky-the-light-bringer', 'H. P. Blavatsky: The Light-Bringer', 'Geoffrey A. Barborka', 'Spirituality', 1970, 76, 4.8, 'The 1970 Blavatsky Lecture — Geoffrey A. Barborka’s portrait of Helena Petrovna Blavatsky, her life, her mission, and the founding of the Theosophical Society.', 'linear-gradient(145deg, #2b1a3d 0%, #6d4a8f 48%, #e9d5ff 100%)', '#6d4a8f', '/hp-blavatsky-the-light-bringer.html', 3),
('mahatma-letters', 'The Mahatma Letters to A. P. Sinnett', 'A. Trevor Barker (compiler)', 'Spirituality', 1923, 650, 4.9, 'The private letters written between 1880 and 1890 by the Mahatmas Koot Hoomi and Morya to A. P. Sinnett and A. O. Hume — transcribed and compiled by A. Trevor Barker.', 'linear-gradient(145deg, #3d2b12 0%, #a67c2e 52%, #f5e6c4 100%)', '#a67c2e', '/mahatma-letters.html', 4),
('thought-forms', 'Thought-Forms', 'Annie Besant & C. W. Leadbeater', 'Spirituality', 1901, 46, 4.7, 'Besant and Leadbeater’s clairvoyant study of how thoughts and emotions take shape and colour in the subtle worlds, with the classic illustrated plates.', 'linear-gradient(145deg, #3f1d38 0%, #c1567b 52%, #f7e8ef 100%)', '#c1567b', '/thought-forms.html', 5),
('wisdom-of-the-heavens', 'Wisdom of the Heavens', 'Master E.K. (Kulapati E. Krishnamacharya)', 'Spirituality', 1987, 151, 4.8, 'Master E.K.’s eleven-chapter guide to spiritual astrology — the astrology of the scriptures, the validity of the zodiac, the measures of time, and the principles governed by the planets.', 'linear-gradient(145deg, #0c1445 0%, #2b4c8c 52%, #ffd97a 100%)', '#2b4c8c', '/wisdom-of-the-heavens.html', 6),
('the-divine-plan', 'The Divine Plan (Excerpt)', 'Geoffrey A. Barborka', 'Spirituality', 1961, 49, 4.7, 'Chapters IX–X of Barborka’s The Divine Plan — the Doctrine of the Rounds and the After-Death States — as a full text edition, with the original diagrams preserved.', 'linear-gradient(145deg, #1a2332 0%, #4a6fa5 52%, #d4e2f5 100%)', '#4a6fa5', '/the-divine-plan.html', 7),
('shape-of-things-study-companion', 'The Shape of Things to Come — Topic Consolidation', 'H. G. Wells', 'Study Guide', 1933, 6, 4.5, 'A complete topic consolidation of Wells’ future-history — structure, themes, and predictions organized as study notes.', 'linear-gradient(145deg, #14251c 0%, #3f6b4f 52%, #cfe8d8 100%)', '#3f6b4f', '/shape-of-things-study-companion.html', 8),
('the-ocean-of-theosophy', 'The Ocean of Theosophy', 'William Q. Judge', 'Spirituality', 1893, 215, 4.9, 'William Q. Judge’s lucid classic — the complete 1893 text: the Masters, the Earth Chain, the septenary constitution of man, reincarnation, karma, devachan, cycles, and psychic laws.', 'linear-gradient(145deg, #0b2e4f 0%, #1e6f8e 52%, #bfe8f0 100%)', '#1e6f8e', '/the-ocean-of-theosophy.html', 9),
('the-ancient-wisdom', 'The Ancient Wisdom', 'Annie Besant', 'Spirituality', 1897, 434, 4.8, 'Annie Besant’s clear outline of the Ancient Wisdom — the planes of nature, kamaloka, devachan, reincarnation, karma, and the building of a cosmos.', 'linear-gradient(145deg, #10321f 0%, #2f7a4f 52%, #d9f2e2 100%)', '#2f7a4f', '/the-ancient-wisdom.html', 10),
('man-visible-and-invisible', 'Man Visible and Invisible', 'C. W. Leadbeater', 'Spirituality', 1902, 150, 4.8, 'Leadbeater’s clairvoyant study of the human aura and subtle bodies, with the celebrated colour plates of the astral and mental bodies.', 'linear-gradient(145deg, #33134d 0%, #7a3fa0 45%, #f2b8c6 100%)', '#7a3fa0', '/man-visible-and-invisible.html', 11),
('the-secret-teachings-of-all-ages', 'The Secret Teachings of All Ages', 'Manly P. Hall', 'Spirituality', 1928, 1655, 4.9, 'Manly P. Hall’s monumental encyclopedia of esoteric wisdom — mysteries, symbolism, alchemy, and the secret doctrines of antiquity, with over 200 original illustrations.', 'linear-gradient(145deg, #2b0f0f 0%, #7a2a1e 50%, #e8c88a 100%)', '#7a2a1e', '/the-secret-teachings-of-all-ages.html', 12),
('the-inner-life', 'The Inner Life', 'C. W. Leadbeater', 'Spirituality', 1910, 1071, 4.7, 'Leadbeater’s Adyar talks on the inner side of the spiritual life — the Great Ones, religion, the theosophical attitude, and the unseen worlds.', 'linear-gradient(145deg, #1d1b4b 0%, #5451a8 52%, #dcd9f7 100%)', '#5451a8', '/the-inner-life.html', 13),
('secret-doctrine-vol-1', 'The Secret Doctrine — Vol. I: Cosmogenesis', 'H. P. Blavatsky', 'Secret Doctrine', 1888, 1491, 4.9, 'Volume I of Blavatsky’s masterwork — Cosmogenesis: the stanzas of Dzyan, the evolution of the cosmos, and the symbolism of world scriptures, with original diagrams.', 'linear-gradient(145deg, #12082b 0%, #43287a 50%, #c9a86a 100%)', '#43287a', '/secret-doctrine-vol-1.html', 14),
('secret-doctrine-vol-2', 'The Secret Doctrine — Vol. II: Anthropogenesis', 'H. P. Blavatsky', 'Secret Doctrine', 1888, 1812, 4.9, 'Volume II — Anthropogenesis: the stanzas on the evolution of humanity, the Root-Races, and the esoteric history of man and the earth.', 'linear-gradient(145deg, #0f2027 0%, #2c5364 55%, #d8c3a5 100%)', '#2c5364', '/secret-doctrine-vol-2.html', 15),
('secret-doctrine-vol-3', 'The Secret Doctrine — Vol. III', 'H. P. Blavatsky', 'Secret Doctrine', 1897, 1137, 4.8, 'The posthumous third volume — further esoteric teachings, commentaries on Eastern scriptures, occult science, and the mystery-language of the initiates.', 'linear-gradient(145deg, #1f0a0a 0%, #6b2d5c 50%, #e0bfb0 100%)', '#6b2d5c', '/secret-doctrine-vol-3.html', 16),
('clairvoyance', 'Clairvoyance', 'C. W. Leadbeater', 'Spirituality', 1899, 203, 4.7, 'Leadbeater’s concise manual on clairvoyance — what it is, the kinds of clear-seeing, and how the faculty may be developed safely and sensibly.', 'linear-gradient(145deg, #101d42 0%, #3a6ea5 55%, #c9dcef 100%)', '#3a6ea5', '/clairvoyance.html', 17),
('isis-unveiled', 'Isis Unveiled', 'H. P. Blavatsky', 'Spirituality', 1877, 2787, 4.9, 'Blavatsky’s first great work — a master-key to the mysteries of ancient and modern science and theology, with the original symbolic illustrations.', 'linear-gradient(145deg, #2b1608 0%, #8a5a2a 50%, #f0d9a8 100%)', '#8a5a2a', '/isis-unveiled.html', 18),
('the-key-to-theosophy', 'The Key to Theosophy', 'H. P. Blavatsky', 'Spirituality', 1889, 405, 4.8, 'Blavatsky’s classic question-and-answer exposition — the Theosophical Society, its teachings, karma, reincarnation, and the nature of man.', 'linear-gradient(145deg, #0d2818 0%, #1e6f5c 55%, #cde8d8 100%)', '#1e6f5c', '/the-key-to-theosophy.html', 19),
('the-voice-of-the-silence', 'The Voice of the Silence', 'H. P. Blavatsky', 'Spirituality', 1889, 67, 4.9, 'The beloved devotional classic translated from the Book of the Golden Precepts — three fragments on the path of the heart and the wisdom of the silence.', 'linear-gradient(145deg, #3d0c11 0%, #a8385d 55%, #f6d9e0 100%)', '#a8385d', '/the-voice-of-the-silence.html', 20),
('the-hidden-side-of-things', 'The Hidden Side of Things', 'C. W. Leadbeater', 'Spirituality', 1913, 808, 4.7, 'Leadbeater’s wide-ranging study of the unseen side of everyday life — the occult effects of places, people, objects, ceremonies, and nature.', 'linear-gradient(145deg, #1a1428 0%, #5c4a8a 55%, #d9d0ee 100%)', '#5c4a8a', '/the-hidden-side-of-things.html', 21),
('collected-fruits-of-occult-teaching', 'Collected Fruits of Occult Teaching', 'A. P. Sinnett', 'Spirituality', 1919, 343, 4.7, 'Sinnett’s mature essays gathering the fruits of a lifetime in theosophy — the Masters, the planetary chain, the higher self, and the future of occult teaching.', 'linear-gradient(145deg, #241a08 0%, #7a5c1e 55%, #ecd9a8 100%)', '#7a5c1e', '/collected-fruits-of-occult-teaching.html', 22),
('in-the-outer-court', 'In the Outer Court', 'Annie Besant', 'Spirituality', 1895, 95, 4.8, 'Besant’s talks on the probationary path — purification, thought-control, the building of character, and service in the outer court of the Mysteries.', 'linear-gradient(145deg, #08202b 0%, #2a7a8a 55%, #cfeef2 100%)', '#2a7a8a', '/in-the-outer-court.html', 23),
('letters-that-have-helped-me', 'Letters That Have Helped Me', 'William Q. Judge', 'Spirituality', 1891, 462, 4.8, 'William Q. Judge’s warm letters of counsel to students — practical encouragement on the path, the inner life, and the everyday trials of the theosophist.', 'linear-gradient(145deg, #1c0f24 0%, #6a3a8a 55%, #e2d3f2 100%)', '#6a3a8a', '/letters-that-have-helped-me.html', 24),
('power-of-now', 'The Power of Now', 'Eckhart Tolle', 'Spirituality', 1997, 242, 4.8, 'Eckhart Tolle’s modern classic on spiritual awakening — leaving identification with the mind, entering the present moment, and living from presence.', 'linear-gradient(145deg, #14261d 0%, #2e7d5b 52%, #cfe8dc 100%)', '#2e7d5b', '/power-of-now.html', 25),
('a-new-earth', 'A New Earth', 'Eckhart Tolle', 'Spirituality', 2005, 189, 4.8, 'Tolle’s follow-up to The Power of Now — the flowering of human consciousness, the anatomy of the ego and the pain-body, and awakened living as the seed of a new earth.', 'linear-gradient(145deg, #101d2b 0%, #2b6cb0 52%, #cfe3f5 100%)', '#2b6cb0', '/a-new-earth.html', 26)
on conflict (id) do update set
  title = excluded.title,
  author = excluded.author,
  genre = excluded.genre,
  year = excluded.year,
  pages = excluded.pages,
  rating = excluded.rating,
  description = excluded.description,
  cover = excluded.cover,
  accent = excluded.accent,
  reader_url = excluded.reader_url,
  sort_order = excluded.sort_order;
