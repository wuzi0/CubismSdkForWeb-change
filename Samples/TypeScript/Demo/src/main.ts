/**
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at https://www.live2d.com/eula/live2d-open-software-license-agreement_en.html.
 */

import { LAppDelegate } from './lappdelegate';
// import * as LAppDefine from './lappdefine';
//新增两个导入
import { resourcesConfig} from './lappdefine';
import { LAppLive2DManager} from './lapplive2dmanager'



// 下面这两个得注释掉，因为我们后面写了一个start()方法，也应用了LAppDelegate.getInstance().run()方法
// 如果不注释掉，应该是执行的上面原生的方法，我也不太清楚，
// 但是如果不注释掉，我打包之后移植到hexo中，就会出现当你点击后退和前进页面按钮的时候，live2d模型就会失效，必须刷新才行，注释掉就修复了这个问题
/**
 * ブラウザロード後の処理
 */
// window.onload = (): void => {
//   // create the application instance
//   if (LAppDelegate.getInstance().initialize() == false) {
//     return;
//   }

//   LAppDelegate.getInstance().run();
// };

/**
 * 終了時の処理
 */
// window.onbeforeunload = (): void => LAppDelegate.releaseInstance();


// 这个是当页面大小改变时，重新调整画布大小，但是这里不需要，因为测试发现页面窗口改变，大小发生异常，原因可能是我们导入的前端js和css本来就设置过
/**
 * Process when changing screen size.
 */
// window.onresize = () => {
//   if (LAppDefine.CanvasSize === 'auto') {
//     LAppDelegate.getInstance().onResize();
//   }
// };



//下面全是新增：

function  start() {

  // create the application instance
  if (LAppDelegate.getInstance().initialize() == false) {
   return;
 }
 LAppDelegate.getInstance().run();
}
function stop() {
 LAppDelegate.releaseInstance();
}
/**
* 根据index来控制切换模型，只能填整数
* @param index 模型的次序
* 从1开始。 小于0：随机加载
* >0加载数组下标为index-1的模型
* ==0 加载下一个模型
*/
function changeScene(index: number) {
 let manager = LAppLive2DManager.getInstance();
 if (index < 0) {
   manager.randomScene();
 } else if (index > 0 ) {
   manager.changeScene(index-1)
 } else if (index ==0) {
   manager.nextScene();
 }
}
module.exports = { start , stop , changeScene , resourcesConfig}
