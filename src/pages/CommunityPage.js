import React, { useState, useEffect } from 'react';
import { Heart, MessageCircle, ArrowLeft, Plus, Send, User, Lock, Eye } from 'lucide-react';
import { useAuth } from '../components/AuthProvider';
import { useNavigate } from 'react-router-dom';

const CommunityPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [posts, setPosts] = useState([]);
  const [showWriteForm, setShowWriteForm] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    category: '썸/연애',
    isAnonymous: true,
    emotionTag: '설렘'
  });
  const [newComment, setNewComment] = useState('');

  const categories = ["전체", "썸/연애", "고백/프로포즈", "연인관계", "이별/재회", "기타"];
  const emotionTags = ["설렘", "불안함", "행복", "고민", "외로움", "기대", "걱정"];

  // 샘플 데이터 초기화
  useEffect(() => {
    const samplePosts = [
      {
        id: 1,
        title: "첫 데이트 후 연락이 뜸해졌어요 😢",
        content: "어제 정말 좋은 분위기로 첫 데이트를 했는데, 오늘 갑자기 연락이 뜸해진 것 같아요. 제가 뭔가 실수했을까요? 정말 좋은 시간이었는데 갑자기 불안해져요. 혹시 제가 너무 적극적이었나요? 아니면 말을 너무 많이 했나요? 계속 핸드폰만 보게 되네요...",
        author: "익명의 토끼",
        authorId: "anon_1",
        isAnonymous: true,
        category: "썸/연애",
        emotionTag: "불안함",
        createdAt: "2시간 전",
        likes: 12,
        isLiked: false,
        views: 156,
        comments: [
          {
            id: 1,
            author: "익명의 나비",
            authorId: "anon_2",
            content: "저도 비슷한 경험이 있어요. 너무 조급해하지 마세요! 상대방도 나름대로 고민이 있을 수 있어요.",
            createdAt: "1시간 전",
            isAnonymous: true
          },
          {
            id: 2,
            author: "이지은",
            authorId: "user_1",
            content: "첫 데이트 후에는 서로 신중해지는 게 자연스러워요. 2-3일 정도는 기다려보는 게 어떨까요?",
            createdAt: "30분 전",
            isAnonymous: false
          }
        ]
      },
      {
        id: 2,
        title: "고백할 타이밍을 모르겠어요",
        content: "6개월째 썸을 타고 있는데 언제 고백해야 할지 모르겠어요. 상대방도 저를 좋아하는 것 같긴 한데 확신이 서지 않아요. 친구들은 빨리 고백하라고 하는데 거절당할까봐 무서워요.",
        author: "김민수",
        authorId: "user_2",
        isAnonymous: false,
        category: "고백/프로포즈",
        emotionTag: "설렘",
        createdAt: "5시간 전",
        likes: 24,
        isLiked: true,
        views: 289,
        comments: []
      },
      {
        id: 3,
        title: "연인과 가치관 차이로 힘들어요",
        content: "1년째 사귀고 있는데 최근에 가치관 차이를 많이 느껴요. 서로 사랑하지만 이런 차이가 나중에 문제가 될까 걱정됩니다.",
        author: "익명의 고양이",
        authorId: "anon_3",
        isAnonymous: true,
        category: "연인관계",
        emotionTag: "고민",
        createdAt: "1일 전",
        likes: 31,
        isLiked: false,
        views: 445,
        comments: []
      }
    ];
    setPosts(samplePosts);
  }, []);

  const handleWritePost = () => {
    if (!user) {
      alert('로그인이 필요합니다.');
      return;
    }
    setShowWriteForm(true);
  };

  const handleSubmitPost = () => {
    if (!newPost.title.trim() || !newPost.content.trim()) {
      alert('제목과 내용을 모두 입력해주세요.');
      return;
    }

    const post = {
      id: posts.length + 1,
      title: newPost.title,
      content: newPost.content,
      author: newPost.isAnonymous ? `익명의 ${['토끼', '고양이', '강아지', '새', '물고기'][Math.floor(Math.random() * 5)]}` : user.name,
      authorId: newPost.isAnonymous ? `anon_${Date.now()}` : user.id,
      isAnonymous: newPost.isAnonymous,
      category: newPost.category,
      emotionTag: newPost.emotionTag,
      createdAt: "방금 전",
      likes: 0,
      isLiked: false,
      views: 1,
      comments: []
    };

    setPosts([post, ...posts]);
    setNewPost({ title: '', content: '', category: '썸/연애', isAnonymous: true, emotionTag: '설렘' });
    setShowWriteForm(false);
    alert('감정이 성공적으로 기록되었습니다! 💕');
  };

  const handleLike = (postId) => {
    if (!user) {
      alert('로그인이 필요합니다.');
      return;
    }

    setPosts(posts.map(post => 
      post.id === postId 
        ? { ...post, likes: post.isLiked ? post.likes - 1 : post.likes + 1, isLiked: !post.isLiked }
        : post
    ));

    if (selectedPost && selectedPost.id === postId) {
      setSelectedPost(prev => ({
        ...prev,
        likes: prev.isLiked ? prev.likes - 1 : prev.likes + 1,
        isLiked: !prev.isLiked
      }));
    }
  };

  const handleViewPost = (post) => {
    const updatedPost = {
      ...post,
      views: post.views + 1
    };
    
    // posts 배열에서 조회수 업데이트
    setPosts(posts.map(p => p.id === post.id ? updatedPost : p));
    setSelectedPost(updatedPost);
  };

  const handleSubmitComment = () => {
    if (!user) {
      alert('로그인이 필요합니다.');
      return;
    }

    if (!newComment.trim()) {
      alert('댓글 내용을 입력해주세요.');
      return;
    }

    const comment = {
      id: (selectedPost.comments?.length || 0) + 1,
      author: user.name,
      authorId: user.id,
      content: newComment,
      createdAt: "방금 전",
      isAnonymous: false
    };

    const updatedPost = {
      ...selectedPost,
      comments: [...(selectedPost.comments || []), comment]
    };

    setSelectedPost(updatedPost);
    
    // posts 배열에서도 업데이트
    setPosts(posts.map(p => p.id === selectedPost.id ? updatedPost : p));
    setNewComment('');
  };

  const navigateToHome = () => {
    navigate('/');
  };

  const getCategoryColor = (category) => {
    const colors = {
      "썸/연애": "bg-pink-100 text-pink-700 border-pink-200",
      "고백/프로포즈": "bg-rose-100 text-rose-700 border-rose-200",
      "연인관계": "bg-purple-100 text-purple-700 border-purple-200",
      "이별/재회": "bg-blue-100 text-blue-700 border-blue-200",
      "기타": "bg-gray-100 text-gray-700 border-gray-200"
    };
    return colors[category] || colors["기타"];
  };

  const getEmotionColor = (emotion) => {
    const colors = {
      "설렘": "bg-red-100 text-red-600 border-red-200",
      "불안함": "bg-orange-100 text-orange-600 border-orange-200",
      "행복": "bg-yellow-100 text-yellow-600 border-yellow-200",
      "고민": "bg-green-100 text-green-600 border-green-200",
      "외로움": "bg-indigo-100 text-indigo-600 border-indigo-200",
      "기대": "bg-pink-100 text-pink-600 border-pink-200",
      "걱정": "bg-gray-100 text-gray-600 border-gray-200"
    };
    return colors[emotion] || colors["기타"];
  };

  const filteredPosts = selectedCategory === '전체' 
    ? posts 
    : posts.filter(post => post.category === selectedCategory);

  // 게시글 상세보기
  if (selectedPost) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-yellow-50">
        <header className="relative z-50 bg-white/50 backdrop-blur-sm border-b border-pink-100">
          <div className="max-w-4xl mx-auto px-4 py-4 flex items-center">
            <button 
              onClick={() => setSelectedPost(null)}
              className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              목록으로
            </button>
            <div className="flex-1 text-center">
              <h1 className="text-lg font-bold text-gray-800">감정 기록</h1>
            </div>
          </div>
        </header>

        <div className="max-w-4xl mx-auto p-4">
          {/* Post Detail */}
          <div className="bg-white/80 backdrop-blur-lg rounded-3xl p-8 border border-pink-100 shadow-lg mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getCategoryColor(selectedPost.category)}`}>
                  {selectedPost.category}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getEmotionColor(selectedPost.emotionTag)}`}>
                  {selectedPost.emotionTag}
                </span>
              </div>
              <div className="flex items-center space-x-4 text-gray-500 text-sm">
                <div className="flex items-center space-x-1">
                  <Eye className="w-4 h-4" />
                  <span>{selectedPost.views}</span>
                </div>
                <span>{selectedPost.createdAt}</span>
              </div>
            </div>

            <h1 className="text-2xl font-bold text-gray-800 mb-4">{selectedPost.title}</h1>
            
            <div className="flex items-center space-x-2 mb-6">
              {selectedPost.isAnonymous ? <Lock className="w-4 h-4 text-gray-400" /> : <User className="w-4 h-4 text-gray-400" />}
              <span className="text-gray-600">{selectedPost.author}</span>
            </div>

            <div className="text-gray-700 leading-relaxed mb-6 whitespace-pre-wrap">
              {selectedPost.content}
            </div>

            <div className="flex items-center space-x-6 pt-4 border-t border-gray-200">
              <button 
                onClick={() => handleLike(selectedPost.id)}
                className={`flex items-center space-x-2 transition-colors ${
                  selectedPost.isLiked ? 'text-pink-500' : 'text-gray-500 hover:text-pink-500'
                }`}
              >
                <Heart className={`w-5 h-5 ${selectedPost.isLiked ? 'fill-current' : ''}`} />
                <span>{selectedPost.likes}</span>
              </button>
              <div className="flex items-center space-x-2 text-gray-500">
                <MessageCircle className="w-5 h-5" />
                <span>{selectedPost.comments?.length || 0}</span>
              </div>
            </div>
          </div>

          {/* Comments */}
          <div className="bg-white/80 backdrop-blur-lg rounded-3xl p-8 border border-pink-100 shadow-lg">
            <h3 className="text-xl font-bold text-gray-800 mb-6">댓글 {selectedPost.comments?.length || 0}개</h3>
            
            {/* Comment Form */}
            {user && (
              <div className="mb-6 p-4 bg-gradient-to-r from-pink-50 to-rose-50 rounded-2xl border border-pink-200">
                <div className="flex space-x-3">
                  <div className="flex-1">
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="따뜻한 댓글을 남겨주세요..."
                      className="w-full p-3 border border-pink-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-pink-300"
                      rows={3}
                    />
                  </div>
                  <button 
                    onClick={handleSubmitComment}
                    className="px-4 py-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl hover:from-pink-600 hover:to-rose-600 transition-all"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {!user && (
              <div className="mb-6 p-4 bg-gray-50 rounded-2xl border border-gray-200 text-center">
                <p className="text-gray-600">댓글을 작성하려면 로그인이 필요합니다.</p>
              </div>
            )}

            {/* Comments List */}
            <div className="space-y-4">
              {selectedPost.comments?.map((comment) => (
                <div key={comment.id} className="p-4 bg-gray-50 rounded-2xl">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      {comment.isAnonymous ? <Lock className="w-4 h-4 text-gray-400" /> : <User className="w-4 h-4 text-gray-400" />}
                      <span className="font-medium text-gray-700">{comment.author}</span>
                    </div>
                    <span className="text-gray-500 text-sm">{comment.createdAt}</span>
                  </div>
                  <p className="text-gray-700">{comment.content}</p>
                </div>
              ))}

              {(!selectedPost.comments || selectedPost.comments.length === 0) && (
                <div className="text-center py-8 text-gray-500">
                  <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <p>아직 댓글이 없습니다. 첫 번째 댓글을 남겨보세요!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 글쓰기 폼
  if (showWriteForm) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-yellow-50">
        <header className="relative z-50 bg-white/50 backdrop-blur-sm border-b border-pink-100">
          <div className="max-w-4xl mx-auto px-4 py-4 flex items-center">
            <button 
              onClick={() => setShowWriteForm(false)}
              className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              취소
            </button>
            <div className="flex-1 text-center">
              <h1 className="text-lg font-bold text-gray-800">감정 기록하기</h1>
            </div>
          </div>
        </header>

        <div className="max-w-4xl mx-auto p-4">
          <div className="bg-white/80 backdrop-blur-lg rounded-3xl p-8 border border-pink-100 shadow-lg">
            <div className="space-y-6">
              {/* 익명/실명 선택 */}
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-3">공개 설정</label>
                <div className="flex space-x-4">
                  <button
                    onClick={() => setNewPost({...newPost, isAnonymous: true})}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-xl border transition-all ${
                      newPost.isAnonymous 
                        ? 'bg-pink-100 border-pink-300 text-pink-700' 
                        : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <Lock className="w-4 h-4" />
                    <span>익명</span>
                  </button>
                  <button
                    onClick={() => setNewPost({...newPost, isAnonymous: false})}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-xl border transition-all ${
                      !newPost.isAnonymous 
                        ? 'bg-blue-100 border-blue-300 text-blue-700' 
                        : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <User className="w-4 h-4" />
                    <span>실명 ({user?.name})</span>
                  </button>
                </div>
              </div>

              {/* 카테고리 선택 */}
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-3">카테고리</label>
                <div className="flex flex-wrap gap-2">
                  {categories.slice(1).map((category) => (
                    <button
                      key={category}
                      onClick={() => setNewPost({...newPost, category})}
                      className={`px-4 py-2 rounded-xl border transition-all ${
                        newPost.category === category
                          ? 'bg-pink-100 border-pink-300 text-pink-700'
                          : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              {/* 감정 태그 선택 */}
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-3">지금 감정</label>
                <div className="flex flex-wrap gap-2">
                  {emotionTags.map((emotion) => (
                    <button
                      key={emotion}
                      onClick={() => setNewPost({...newPost, emotionTag: emotion})}
                      className={`px-4 py-2 rounded-xl border transition-all ${
                        newPost.emotionTag === emotion
                          ? getEmotionColor(emotion)
                          : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {emotion}
                    </button>
                  ))}
                </div>
              </div>

              {/* 제목 입력 */}
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-3">제목</label>
                <input
                  type="text"
                  value={newPost.title}
                  onChange={(e) => setNewPost({...newPost, title: e.target.value})}
                  placeholder="제목을 입력해주세요"
                  className="w-full px-4 py-3 border border-pink-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-300"
                  maxLength={100}
                />
                <p className="text-xs text-gray-500 mt-1">{newPost.title.length}/100</p>
              </div>

              {/* 내용 입력 */}
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-3">내용</label>
                <textarea
                  value={newPost.content}
                  onChange={(e) => setNewPost({...newPost, content: e.target.value})}
                  placeholder="당신의 마음을 자유롭게 표현해보세요..."
                  className="w-full px-4 py-3 border border-pink-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-pink-300"
                  rows={8}
                  maxLength={1000}
                />
                <p className="text-xs text-gray-500 mt-1">{newPost.content.length}/1000</p>
              </div>

              <button
                onClick={handleSubmitPost}
                disabled={!newPost.title.trim() || !newPost.content.trim()}
                className={`w-full py-3 px-6 rounded-xl font-bold transition-all duration-300 transform ${
                  newPost.title.trim() && newPost.content.trim()
                    ? 'bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white hover:scale-105 shadow-lg'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                감정 기록하기
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 메인 게시판
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-yellow-50">
      <header className="relative z-50 bg-white/50 backdrop-blur-sm border-b border-pink-100">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center">
          <button 
            onClick={navigateToHome}
            className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            홈으로
          </button>
          <div className="flex-1 text-center">
            <h1 className="text-lg font-bold text-gray-800">감정 기록</h1>
          </div>
          <button 
            onClick={handleWritePost}
            className="flex items-center space-x-2 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white px-4 py-2 rounded-xl transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>글쓰기</span>
          </button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-4">
        <div className="text-center mb-8 pt-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            감정 기록 게시판
          </h1>
          <p className="text-gray-600 text-lg">
            여러분의 소중한 연애 이야기를 공유해보세요 💕
          </p>
        </div>

        {/* Category Filter */}
        <div className="mb-8">
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-4 border border-pink-100 shadow-lg">
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-xl border transition-all ${
                    selectedCategory === category
                      ? 'bg-pink-100 border-pink-300 text-pink-700'
                      : 'border-gray-300 text-gray-600 hover:bg-pink-50 hover:border-pink-300 hover:text-pink-700'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Posts Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPosts.map((post) => (
            <div 
              key={post.id}
              onClick={() => handleViewPost(post)}
              className="bg-white/80 backdrop-blur-lg rounded-3xl p-6 border border-pink-100 shadow-lg hover:shadow-xl transition-all cursor-pointer hover:scale-105"
            >
              <div className="flex items-center justify-between mb-3">
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getCategoryColor(post.category)}`}>
                  {post.category}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getEmotionColor(post.emotionTag)}`}>
                  {post.emotionTag}
                </span>
              </div>

              <h3 className="font-bold text-gray-800 mb-3 line-clamp-2">{post.title}</h3>
              
              <p className="text-gray-600 text-sm mb-4 line-clamp-3">{post.content}</p>

              <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                <div className="flex items-center space-x-1">
                  {post.isAnonymous ? <Lock className="w-3 h-3" /> : <User className="w-3 h-3" />}
                  <span className="truncate max-w-20">{post.author}</span>
                </div>
                <span>{post.createdAt}</span>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLike(post.id);
                    }}
                    className={`flex items-center space-x-1 transition-colors ${
                      post.isLiked ? 'text-pink-500' : 'text-gray-500 hover:text-pink-500'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${post.isLiked ? 'fill-current' : ''}`} />
                    <span className="text-sm">{post.likes}</span>
                  </button>
                  <div className="flex items-center space-x-1 text-gray-500">
                    <MessageCircle className="w-4 h-4" />
                    <span className="text-sm">{post.comments?.length || 0}</span>
                  </div>
                  <div className="flex items-center space-x-1 text-gray-500">
                    <Eye className="w-4 h-4" />
                    <span className="text-sm">{post.views}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredPosts.length === 0 && (
          <div className="text-center py-16">
            <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-600 mb-2">
              {selectedCategory === '전체' ? '아직 감정 기록이 없어요' : `${selectedCategory} 카테고리에 글이 없어요`}
            </h3>
            <p className="text-gray-500 mb-6">첫 번째 감정을 기록해보세요!</p>
            <button 
              onClick={handleWritePost}
              className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              감정 기록하기
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommunityPage;