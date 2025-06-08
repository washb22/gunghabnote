import React, { useState, useEffect } from 'react';
import { Heart, MessageCircle, ArrowLeft, Plus, Send, User, Lock, Eye } from 'lucide-react';
import { useAuth } from '../components/AuthProvider';
import { useNavigate } from 'react-router-dom';

// Firebase Firestore 관련 임포트
import { db } from '../firebase';
import { collection, addDoc, getDocs, query, orderBy, serverTimestamp, doc, updateDoc, increment } from 'firebase/firestore';

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
  const [isCommentAnonymous, setIsCommentAnonymous] = useState(true); // 댓글 익명 상태 추가

  const categories = ["전체", "썸/연애", "고백/프로포즈", "연인관계", "이별/재회", "기타"];
  const emotionTags = ["설렘", "불안함", "행복", "고민", "외로움", "기대", "걱정"];

  // 게시글 불러오기 (Firestore에서)
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const postsCollectionRef = collection(db, 'posts');
        // 최신 글이 위에 오도록 createdAt 기준으로 내림차순 정렬
        const q = query(postsCollectionRef, orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);

        const fetchedPosts = querySnapshot.docs.map(doc => {
          // Firebase Timestamp를 JavaScript Date 객체로 변환하여 로컬 형식으로 표시
          const createdAt = doc.data().createdAt?.toDate ? doc.data().createdAt.toDate() : new Date(); // Timestamp가 아닐 경우 대비
          return {
            id: doc.id,
            ...doc.data(),
            createdAt: createdAt.toLocaleString('ko-KR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
            }) // 사용자에게 친숙한 형식으로 변환
          };
        });
        setPosts(fetchedPosts);
      } catch (error) {
        console.error("Error fetching posts: ", error);
        alert("게시글을 불러오는 데 실패했습니다.");
      }
    };

    fetchPosts();
  }, []); // 컴포넌트 마운트 시 한 번만 실행되도록 빈 의존성 배열 사용

  const handleWritePost = () => {
    if (!user) {
      alert('로그인이 필요합니다.');
      return;
    }
    setShowWriteForm(true);
  };

  const handleSubmitPost = async () => { // async 키워드 추가
    if (!newPost.title.trim() || !newPost.content.trim()) {
      alert('제목과 내용을 모두 입력해주세요.');
      return;
    }
    if (!user) { // 로그인 안 된 상태에서 submit 방지 (handleWritePost에서 이미 체크하지만 혹시 모를 경우 대비)
      alert('로그인 정보가 없습니다. 다시 로그인 해주세요.');
      return;
    }

    try {
      const postData = {
        title: newPost.title,
        content: newPost.content,
        author: newPost.isAnonymous ? `익명의 ${['토끼', '고양이', '강아지', '새', '물고기'][Math.floor(Math.random() * 5)]}` : user.name,
        authorId: newPost.isAnonymous ? `anon_${user.id}` : user.id, // 실제 user.id 사용
        isAnonymous: newPost.isAnonymous,
        category: newPost.category,
        emotionTag: newPost.emotionTag,
        createdAt: serverTimestamp(), // Firebase 서버 시간으로 저장 (정확한 시간 순서 보장)
        likes: 0,
        views: 0,
        comments: [] // 댓글은 별도의 서브컬렉션으로 관리하거나 배열로 초기화 (현재는 배열로)
      };

      // Firestore 'posts' 컬렉션에 문서 추가
      const docRef = await addDoc(collection(db, 'posts'), postData);
      console.log('Document written with ID: ', docRef.id);

      // 성공적으로 저장되면 로컬 상태를 업데이트 (Firestore에서 가져오는 시간 포맷에 맞춰)
      setPosts(prevPosts => [
        { 
          ...postData, 
          id: docRef.id, 
          createdAt: new Date().toLocaleString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
          }) 
        }, 
        ...prevPosts
      ]);
      setNewPost({ title: '', content: '', category: '썸/연애', isAnonymous: true, emotionTag: '설렘' });
      setShowWriteForm(false);
      alert('감정이 성공적으로 기록되었습니다! 💕');

    }
     catch (e) {
      console.error('Error adding document: ', e);
      alert('글 저장 중 오류가 발생했습니다. 다시 시도해주세요.');
    }
  };

  const handleLike = async (postId) => { // async 키워드 추가
    if (!user) {
      alert('로그인이 필요합니다.');
      return;
    }

    const postRef = doc(db, 'posts', postId);
    const currentPost = posts.find(p => p.id === postId);

    if (currentPost) {
      try {
        await updateDoc(postRef, {
          likes: currentPost.isLiked ? increment(-1) : increment(1)
        });
        
        // 로컬 상태 업데이트 (옵티미스틱 업데이트)
        setPosts(prevPosts => prevPosts.map(post => 
          post.id === postId 
            ? { ...post, likes: post.isLiked ? post.likes - 1 : post.likes + 1, isLiked: !post.isLiked }
            : post
        ));

        // 상세보기 상태 업데이트 (만약 보고 있는 글이라면)
        if (selectedPost && selectedPost.id === postId) {
          setSelectedPost(prev => ({
            ...prev,
            likes: prev.isLiked ? prev.likes - 1 : prev.likes + 1,
            isLiked: !prev.isLiked
          }));
        }

      } catch (e) {
        console.error('Error updating likes: ', e);
        alert('좋아요 처리 중 오류가 발생했습니다.');
      }
    }
  };

  const handleViewPost = async (post) => { // async 키워드 추가
    const postRef = doc(db, 'posts', post.id);
    try {
      await updateDoc(postRef, {
        views: increment(1)
      });
      
      // 로컬 상태 업데이트
      const updatedPost = {
        ...post,
        views: post.views + 1
      };
      setPosts(prevPosts => prevPosts.map(p => p.id === post.id ? updatedPost : p));
      setSelectedPost(updatedPost);

    } catch (e) {
      console.error('Error updating views: ', e);
    }
  };

  const handleSubmitComment = async () => { // async 키워드 추가
    if (!user) {
      alert('로그인이 필요합니다.');
      return;
    }

    if (!newComment.trim()) {
      alert('댓글 내용을 입력해주세요.');
      return;
    }

    if (!selectedPost) { // 댓글 달 게시글이 없으면 에러
      alert('댓글을 달 게시글을 찾을 수 없습니다.');
      return;
    }

    const comment = {
      id: `comment_${Date.now()}`, // 고유 ID 생성
      author: isCommentAnonymous ? `익명의 ${['새싹', '별', '달', '구름', '햇살'][Math.floor(Math.random() * 5)]}` : user.name, // isCommentAnonymous에 따라 작가 이름 설정
      authorId: user.id, // 실제 사용자 ID는 저장 (익명이어도)
      content: newComment,
      createdAt: new Date().toLocaleString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      }),
      isAnonymous: isCommentAnonymous // isCommentAnonymous 상태 값 사용
    };

    const postRef = doc(db, 'posts', selectedPost.id); // Firestore db에서 postRef 가져오기
    const updatedComments = [...(selectedPost.comments || []), comment];

    try {
      // 게시글 문서의 comments 배열 업데이트
      await updateDoc(postRef, {
        comments: updatedComments
      });

      // 로컬 상태 업데이트
      const updatedPostInState = {
        ...selectedPost,
        comments: updatedComments
      };
      setSelectedPost(updatedPostInState); // 상세보기 상태 업데이트
      setPosts(prevPosts => prevPosts.map(p => p.id === selectedPost.id ? updatedPostInState : p)); // 전체 목록 상태 업데이트
      setNewComment(''); // 댓글 입력 폼 초기화
      setIsCommentAnonymous(true); // 댓글 작성 후 익명 기본값으로 리셋 (선택 사항)
      alert('댓글이 성공적으로 등록되었습니다! 💬');

    } catch (e) {
      console.error('Error adding comment: ', e);
      alert('댓글 등록 중 오류가 발생했습니다.');
    }
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
                {/* 익명/실명 선택 추가 */}
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-medium mb-3">공개 설정</label>
                  <div className="flex space-x-4">
                      <button
                          onClick={() => setIsCommentAnonymous(true)}
                          className={`flex items-center space-x-2 px-4 py-2 rounded-xl border transition-all ${
                            isCommentAnonymous
                                ? 'bg-pink-100 border-pink-300 text-pink-700'
                                : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
                          }`}
                      >
                          <Lock className="w-4 h-4" />
                          <span>익명</span>
                      </button>
                      <button
                          onClick={() => setIsCommentAnonymous(false)}
                          className={`flex items-center space-x-2 px-4 py-2 rounded-xl border transition-all ${
                            !isCommentAnonymous
                                ? 'bg-blue-100 border-blue-300 text-blue-700'
                                : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
                          }`}
                      >
                          <User className="w-4 h-4" />
                          <span>실명 ({user?.name})</span>
                      </button>
                  </div>
                </div>
                {/* 여기까지 추가 */}
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