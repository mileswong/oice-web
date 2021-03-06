import request from 'superagent';
import { API_URL, API_HEADER } from '../constants';

export const fetchTypedAssetsListByLibrary = (libraryId, assetType) =>
  request.get(`${API_URL}library/${libraryId}/assets/${assetType}`)
    .withCredentials()
    .set(API_HEADER)
    .then((response) => {
      if (response.ok) {
        return response.body.assets;
      }
      return [];
    });

export const fetchStoryAssetList = storyId =>
  request.get(`${API_URL}story/${storyId}/assets`)
    .withCredentials()
    .set(API_HEADER)
    .then((response) => {
      if (response.ok) {
        return response.body.assets;
      }
      return [];
    });

export const fetchAsset = assetId =>
  request.get(`${API_URL}asset/${assetId}`)
    .withCredentials()
    .set(API_HEADER)
    .then((response) => {
      if (response.ok) {
        return response.body.asset;
      }
      return null;
    });

const getAssetMeta = (asset) => {
  const {
    nameEn,
    nameTw,
    nameJp,
    users,
    creditsUrl,
  } = asset;

  if (nameEn.length === 0) return Promise.reject(new Error('Asset name cannot be empty.'));

  const meta = {
    nameEn,
    nameTw,
    nameJp,
    creditsUrl,
  };
  if (users) meta.credits = users.map(user => user.id);
  if (asset.characterId) meta.characterId = asset.characterId;

  return meta;
};

const postAsset = (asset, file, type, progressHandler) => {
  const libraryId = asset.libraryId || asset[0].libraryId;
  const url = (type ?
    `${API_URL}library/${libraryId}/assets/${type}` :
    `${API_URL}asset/${asset.id}`
  );

  let post = request
    .post(url)
    .withCredentials()
    .set(API_HEADER);

  const hasMultipleAssets = Array.isArray(asset);
  let meta;
  if (hasMultipleAssets) {
    meta = asset.map(a => getAssetMeta(a));
    file.forEach((f, index) => {
      post.attach(`asset${index}`, f);
    });
  } else {
    meta = getAssetMeta(asset);
    post = post.attach('asset', file);
  }

  post.field('meta', JSON.stringify(meta));
  post = post.on('progress', (e) => {
    if (progressHandler) progressHandler(e.percent);
  });

  return post.then((response) => {
    if (response.ok) {
      const result = {
        jobId: response.body.jobId,
      };
      if (hasMultipleAssets) {
        result.assets = response.body.assets;
      } else {
        result.asset = response.body.asset;
      }
      return result;
    }
    return null;
  });
};

export const addAsset = (asset, file, type, progressHandler) =>
  postAsset(asset, file, type, progressHandler);

export const updateAsset = (asset, file) => postAsset(asset, file);

export const deleteAsset = assetId =>
  request.del(`${API_URL}asset/${assetId}`)
    .withCredentials()
    .set(API_HEADER)
    .then((response) => {
      if (response.ok) {
        return response.body.message;
      }
      return null;
    });
