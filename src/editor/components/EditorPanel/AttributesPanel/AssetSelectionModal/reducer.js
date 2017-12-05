import { handleActions } from 'redux-actions';

import Actions from './actions';

const initialState = {
  assets: [],
  libraries: null,
  open: false,
  recentUsedAssets: [],
  selectedAssetId: 0,
  title: '',
  onSelected: null,
};

export default handleActions({
  [Actions.open]: (state, { payload }) => {
    const assets = payload.assets || [];
    // only display assets that are not hidden
    const assetIds = new Set(assets.map(a => a.id));
    const recentUsedAssets = (payload.recentUsedAssets || []).filter(a => assetIds.has(a.id));
    return {
      ...state,
      libraries: payload.libraries,
      open: true,
      selectedAssetId: payload.selectedAssetId || 0,
      title: payload.title || '',
      onSelected: payload.onSelected || null,
      assets,
      recentUsedAssets,
    };
  },
  [Actions.close]: (state, { payload }) => ({
    ...state,
    open: false,
  }),
}, initialState);
