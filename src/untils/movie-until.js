const db = wx.cloud.database();
const PAGE = 3;//我的收藏缩略展示数
//查找收藏列表前三数据
async function getCollectionInfo(){
    let userinfoStorage = wx.getStorageSync('userInfo');
    let collectionInfo = [];
    await db.collection('collection_movie').where({
        _openid: userinfoStorage.openid,
        star_flag:0
      }).orderBy('star_time', 'desc').limit(PAGE).get().then(
        res=>{
            collectionInfo = res.data
        }
      )
    return collectionInfo;
}
export {getCollectionInfo}