// 구글 로그인 사용자 기반 통계 시스템
class AnalyticsManager {
    constructor() {
        this.db = window.firebaseDb;
        this.auth = window.firebaseAuth;
    }

    // 팔자 분석 결과 저장 (로그인 사용자만)
    async saveAnalysisResult(data) {
        try {
            // 로그인된 사용자만 통계에 포함
            if (!this.auth.currentUser) {
                console.log('비로그인 사용자 - 통계 저장 생략');
                return;
            }

            const user = this.auth.currentUser;
            const timestamp = new Date();
            
            // 사용자별 팔자 유형 저장 (프로필 업데이트)
            await this.saveUserPaljaType(user.uid, data.paljaType, data.result);
            
            const resultData = {
                type: 'palja_analysis',
                result: data.result,
                birthYear: data.birthYear,
                birthMonth: data.birthMonth,
                birthDay: data.birthDay,
                isLeapMonth: data.isLeapMonth || false,
                paljaType: data.paljaType,
                mbtiType: data.mbtiType || null,
                gender: data.gender || null,
                ageGroup: this.calculateAgeGroup(data.birthYear),
                timestamp: timestamp,
                userId: user.uid,
                userEmail: user.email,
                userName: user.displayName || '익명',
                userPhoto: user.photoURL || null
            };

            await this.db.collection('user_analytics').add(resultData);
            console.log('팔자 분석 결과 저장 완료 (로그인 사용자)');
        } catch (error) {
            console.error('팔자 분석 결과 저장 실패:', error);
        }
    }

    // 사용자 팔자 유형 저장
    async saveUserPaljaType(userId, paljaType, paljaResult) {
        try {
            const userRef = this.db.collection('user_profiles').doc(userId);
            
            await userRef.set({
                paljaType: paljaType,
                paljaResult: paljaResult,
                lastAnalysisDate: new Date(),
                analysisCount: firebase.firestore.FieldValue.increment(1)
            }, { merge: true });
            
            console.log('사용자 팔자 유형 저장 완료');
        } catch (error) {
            console.error('사용자 팔자 유형 저장 실패:', error);
        }
    }

    // 시너지 분석 결과 저장 (로그인 사용자만)
    async saveSynergyResult(data) {
        try {
            // 로그인된 사용자만 통계에 포함
            if (!this.auth.currentUser) {
                console.log('비로그인 사용자 - 시너지 통계 저장 생략');
                return;
            }

            const user = this.auth.currentUser;
            const timestamp = new Date();
            
            const resultData = {
                type: 'synergy_analysis',
                score: data.score,
                synergyType: data.synergyType,
                mbtiType1: data.mbtiType1,
                mbtiType2: data.mbtiType2,
                paljaType1: data.paljaType1,
                paljaType2: data.paljaType2,
                compatibility: data.compatibility,
                timestamp: timestamp,
                userId: user.uid,
                userEmail: user.email,
                userName: user.displayName || '익명',
                userPhoto: user.photoURL || null
            };

            await this.db.collection('user_analytics').add(resultData);
            console.log('시너지 분석 결과 저장 완료 (로그인 사용자)');
        } catch (error) {
            console.error('시너지 분석 결과 저장 실패:', error);
        }
    }

    // 사용자 팔자 유형 조회
    async getUserPaljaType(userId) {
        try {
            const userDoc = await this.db.collection('user_profiles').doc(userId).get();
            if (userDoc.exists) {
                return userDoc.data();
            }
            return null;
        } catch (error) {
            console.error('사용자 팔자 유형 조회 실패:', error);
            return null;
        }
    }

    // 팔자 유형별 사용자 수 랭킹 조회
    async getPaljaTypeRankings() {
        try {
            const snapshot = await this.db.collection('user_profiles').get();

            const typeCount = {};
            snapshot.forEach(doc => {
                const data = doc.data();
                const paljaType = data.paljaType;
                
                if (paljaType) {
                    typeCount[paljaType] = (typeCount[paljaType] || 0) + 1;
                }
            });

            // 사용자 수 기준으로 정렬
            const rankings = Object.entries(typeCount)
                .sort(([,a], [,b]) => b - a)
                .map(([type, count], index) => ({
                    rank: index + 1,
                    paljaType: type,
                    userCount: count
                }));

            return rankings;
        } catch (error) {
            console.error('팔자 유형별 랭킹 조회 실패:', error);
            return [];
        }
    }

    // 연령대 계산
    calculateAgeGroup(birthYear) {
        const currentYear = new Date().getFullYear();
        const age = currentYear - birthYear;
        
        if (age < 20) return '10대';
        if (age < 30) return '20대';
        if (age < 40) return '30대';
        if (age < 50) return '40대';
        if (age < 60) return '50대';
        return '60대+';
    }

    // 세션 ID 생성/가져오기
    getSessionId() {
        let sessionId = sessionStorage.getItem('analytics_session_id');
        if (!sessionId) {
            sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            sessionStorage.setItem('analytics_session_id', sessionId);
        }
        return sessionId;
    }

    // 사용자 고유 식별자 생성 (브라우저 지문)
    getUserFingerprint() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        ctx.textBaseline = 'top';
        ctx.font = '14px Arial';
        ctx.fillText('Browser fingerprint', 2, 2);
        
        const fingerprint = [
            navigator.userAgent,
            navigator.language,
            screen.width + 'x' + screen.height,
            new Date().getTimezoneOffset(),
            canvas.toDataURL()
        ].join('|');
        
        // 간단한 해시 생성
        let hash = 0;
        for (let i = 0; i < fingerprint.length; i++) {
            const char = fingerprint.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // 32bit 정수로 변환
        }
        return 'fp_' + Math.abs(hash).toString(36);
    }

    // 중복 분석 체크 (10분 내 동일한 결과)
    async checkDuplicateAnalysis(type, userFingerprint, data) {
        try {
            const tenMinutesAgo = new Date();
            tenMinutesAgo.setMinutes(tenMinutesAgo.getMinutes() - 10);

            const snapshot = await this.db.collection('analytics')
                .where('type', '==', type)
                .where('userFingerprint', '==', userFingerprint)
                .where('timestamp', '>=', tenMinutesAgo)
                .get();

            console.log(`중복 체크: ${type}, 최근 10분 내 기록 ${snapshot.size}개`);

            // 팔자 분석의 경우 생년월일과 결과 체크
            if (type === 'palja_analysis' && data.birthYear) {
                for (const doc of snapshot.docs) {
                    const docData = doc.data();
                    if (docData.birthYear === data.birthYear && 
                        docData.birthMonth === data.birthMonth && 
                        docData.birthDay === data.birthDay &&
                        docData.paljaType === data.paljaType) {
                        console.log('중복 팔자 분석 발견 - 저장 생략');
                        return true;
                    }
                }
            }
            
            // 시너지 분석의 경우 MBTI, 팔자, 점수 조합 체크
            if (type === 'synergy_analysis') {
                for (const doc of snapshot.docs) {
                    const docData = doc.data();
                    if (docData.mbtiType1 === data.mbtiType1 && 
                        docData.paljaType1 === data.paljaType1 &&
                        Math.abs(docData.score - data.score) < 1) { // 점수 차이 1점 미만
                        console.log('중복 시너지 분석 발견 - 저장 생략');
                        return true;
                    }
                }
            }

            return false;
        } catch (error) {
            console.error('중복 체크 실패:', error);
            return false;
        }
    }

    // 통계 데이터 조회 (관리자용 - 로그인 사용자만)
    async getStatistics(dateRange = 30) {
        try {
            const endDate = new Date();
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - dateRange);

            const snapshot = await this.db.collection('user_analytics')
                .where('timestamp', '>=', startDate)
                .where('timestamp', '<=', endDate)
                .get();

            const data = [];
            snapshot.forEach(doc => {
                data.push({ id: doc.id, ...doc.data() });
            });

            return this.processStatistics(data);
        } catch (error) {
            console.error('통계 데이터 조회 실패:', error);
            return null;
        }
    }

    // 통계 데이터 처리
    processStatistics(data) {
        const stats = {
            total: data.length,
            paljaAnalysis: data.filter(d => d.type === 'palja_analysis'),
            synergyAnalysis: data.filter(d => d.type === 'synergy_analysis'),
            paljaTypes: {},
            mbtiTypes: {},
            ageGroups: {},
            synergyScores: {},
            dailyStats: {},
            topCombinations: {}
        };

        // 팔자 유형별 통계
        stats.paljaAnalysis.forEach(item => {
            if (item.paljaType) {
                stats.paljaTypes[item.paljaType] = (stats.paljaTypes[item.paljaType] || 0) + 1;
            }
            if (item.mbtiType) {
                stats.mbtiTypes[item.mbtiType] = (stats.mbtiTypes[item.mbtiType] || 0) + 1;
            }
            if (item.ageGroup) {
                stats.ageGroups[item.ageGroup] = (stats.ageGroups[item.ageGroup] || 0) + 1;
            }
        });

        // 시너지 점수별 통계
        stats.synergyAnalysis.forEach(item => {
            const scoreRange = this.getScoreRange(item.score);
            stats.synergyScores[scoreRange] = (stats.synergyScores[scoreRange] || 0) + 1;
            
            // 인기 조합 통계
            const combination = `${item.mbtiType1}-${item.mbtiType2}`;
            stats.topCombinations[combination] = (stats.topCombinations[combination] || 0) + 1;
        });

        // 일별 통계
        data.forEach(item => {
            const date = new Date(item.timestamp.toDate()).toISOString().split('T')[0];
            stats.dailyStats[date] = (stats.dailyStats[date] || 0) + 1;
        });

        return stats;
    }

    // 점수 범위 계산
    getScoreRange(score) {
        if (score >= 90) return '90-100점 (환상적)';
        if (score >= 70) return '70-89점 (잠재력)';
        if (score >= 50) return '50-69점 (주의필요)';
        return '0-49점 (부조화)';
    }

    // 실시간 통계 업데이트 (관리자 대시보드용)
    subscribeToRealTimeStats(callback) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        return this.db.collection('analytics')
            .where('timestamp', '>=', today)
            .onSnapshot(snapshot => {
                const todayData = [];
                snapshot.forEach(doc => {
                    todayData.push({ id: doc.id, ...doc.data() });
                });
                
                const todayStats = this.processStatistics(todayData);
                callback(todayStats);
            });
    }
}

// 전역 인스턴스는 각 페이지에서 개별적으로 생성

// 페이지 방문 통계
document.addEventListener('DOMContentLoaded', function() {
    // 페이지 뷰 기록
    if (window.analyticsManager && window.analyticsManager.db) {
        window.analyticsManager.db.collection('page_views').add({
            page: window.location.pathname,
            timestamp: new Date(),
            userId: window.firebaseAuth?.currentUser?.uid || 'anonymous',
            userAgent: navigator.userAgent,
            referrer: document.referrer
        }).catch(error => {
            console.error('페이지 뷰 기록 실패:', error);
        });
    }
});
