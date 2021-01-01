export const state = () => ({
  currentActivityTab: 'index',
  currentUserId: ''
});

export const mutations = {
  setCurrentActivityTab(state, currentActivityTab) {
    state.currentActivityTab = currentActivityTab;
  },
  setCurrentUserId(state, currentUserId) {
    state.currentUserId = currentUserId;
  }
};
