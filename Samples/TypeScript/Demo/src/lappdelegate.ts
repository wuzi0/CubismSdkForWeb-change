/**
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at https://www.live2d.com/eula/live2d-open-software-license-agreement_en.html.
 */

import { CubismFramework, Option } from '@framework/live2dcubismframework';

import * as LAppDefine from './lappdefine';
import { LAppLive2DManager } from './lapplive2dmanager';
import { LAppPal } from './lapppal';
import { LAppTextureManager } from './lapptexturemanager';
import { LAppView } from './lappview';

export let canvas: HTMLCanvasElement = null;
export let s_instance: LAppDelegate = null;
export let gl: WebGLRenderingContext = null;
export let frameBuffer: WebGLFramebuffer = null;

/**
 * 应用程序类。
 * 管理Cubism SDK。
 */
export class LAppDelegate {
  /**
   * 返回一个类的实例。  クラスのインスタンス（シングルトン）を返す。
   * 如果未生成实例，则在内部生成实例  インスタンスが生成されていない場合は内部でインスタンスを生成する。
   *
   * @return 类实例  クラスのインスタンス
   */
  public static getInstance(): LAppDelegate {
    if (s_instance == null) {
      s_instance = new LAppDelegate();
    }

    return s_instance;
  }

  /**
   * 释放类实例（单个）  クラスのインスタンス（シングルトン）を解放する。
   */
  public static releaseInstance(): void {
    if (s_instance != null) {
      s_instance.release();
    }

    s_instance = null;
  }

  /**
   * 初始化APP需要的东西APPに必要な物を初期化する。
   */
  public initialize(): boolean {
    // 创建画布  キャンバスの作成
    // canvas = document.createElement('canvas');


    // 这里需要将原来的canvas的赋值语句替换成下方的
    canvas = <HTMLCanvasElement>document.getElementById("live2d");

    //添加以下内容到函数体
    //页面鼠标移动事件监听，让模型眼睛方向跟着鼠标移动，并且获取到live2d元素的id，用于css样式控制，类似于canvas = <HTMLCanvasElement>document.getElementById("live2d")的代码
    
    
    document.addEventListener("mousemove",function(e){
      // if(!LAppDelegate.getInstance()._view)
      // {
      //   LAppPal.printLog("view notfound");
      //   return;
      // }

      //之前是用document对象来获取canvas，其实已经有全局变量了，这里也可以直接用
      let rect = canvas.getBoundingClientRect();
      let posX: number = e.clientX - rect.left;
      let posY: number = e.clientY - rect.top;
      
      // console.log("onMouseMoved: gate文件中posY值为： 【"+posY+"】  canvas的top距离为："+rect.top);
      LAppDelegate.getInstance()._view.onTouchesMoved(posX, posY);

      },false);


    //但是鼠标离开浏览器后,视角会保持在鼠标离开时的位置,所以需要添加以下内容
    //页面鼠标离开事件监听,让其视角回到默认位置
    document.addEventListener("mouseout",function(e){
      //鼠标离开document后，将其位置置为（0，0）  
      let live2DManager: LAppLive2DManager = LAppLive2DManager.getInstance();
      live2DManager.onDrag(0.0, 0.0);
      },false);

    
    //添加鼠标点击事件
    document.addEventListener("click",function(e){

      let rect = canvas.getBoundingClientRect();
      let posX: number = e.clientX - rect.left;
      let posY: number = e.clientY - rect.top;
      
      // console.log("onMouseMoved: gate文件中posY值为： 【"+posY+"】  canvas的top距离为："+rect.top);
      LAppDelegate.getInstance()._view.onTouchesBegan(posX, posY);
      LAppDelegate.getInstance()._view.onTouchesEnded(posX, posY);
      },false);


    // if (LAppDefine.CanvasSize === 'auto') {
    //   this._resizeCanvas();
    // } else {
    //   canvas.width = LAppDefine.CanvasSize.width;
    //   canvas.height = LAppDefine.CanvasSize.height;
    // }

    // 初始化gl上下文  glコンテキストを初期化
    // @ts-ignore
    gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

    if (!gl) {
      alert('Cannot initialize WebGL. This browser does not support.');
      gl = null;

      document.body.innerHTML =
        'This browser does not support the <code>&lt;canvas&gt;</code> element.';

      // gl初期化失敗
      return false;
    }

    // 将画布添加到DOM    キャンバスを DOM に追加
    // document.body.appendChild(canvas);

    if (!frameBuffer) {
      frameBuffer = gl.getParameter(gl.FRAMEBUFFER_BINDING);
    }

    // 透过设定   透過設定
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  
/** 注释掉原有的点击和触摸事件
    const supportTouch: boolean = 'ontouchend' in canvas;

    if (supportTouch) {
      // 触摸关联回调函数登录   タッチ関連コールバック関数登録
      // 这个好像是对于手机的，也就是supportTouch为true的时候才会执行，表明这个设备支持触摸
      canvas.ontouchstart = onTouchBegan;
      canvas.ontouchmove = onTouchMoved;
      canvas.ontouchend = onTouchEnded;
      canvas.ontouchcancel = onTouchCancel;
    } else {
      // 鼠标关联回调函数注册  マウス関連コールバック関数登録
      // 那么这里就是不支持触摸的设备，也就是网页端，变成触发鼠标相关的事件
      // 由于我们已经写了鼠标移动和点击事件，所以这里就不需要了，方便后续调试

      // canvas.onmousedown = onClickBegan;
      // canvas.onmousemove = onMouseMoved;
      // canvas.onmouseup = onClickEnded;
    }
*/
    // 初始化AppView    AppViewの初期化
    this._view.initialize();

    // 初始化Cubism SDK  Cubism SDKの初期化
    this.initializeCubism();

    return true;
  }

  /**
   * Resize canvas and re-initialize view.
   */
  public onResize(): void {
    this._resizeCanvas();
    this._view.initialize();
    this._view.initializeSprite();

    // 传递画布大小   キャンバスサイズを渡す
    const viewport: number[] = [0, 0, canvas.width, canvas.height];

    gl.viewport(viewport[0], viewport[1], viewport[2], viewport[3]);
  }

  /**
   * 解放。 解放する。
   */
  public release(): void {
    this._textureManager.release();
    this._textureManager = null;

    this._view.release();
    this._view = null;

    // 释放资源   リソースを解放
    LAppLive2DManager.releaseInstance();

    // 释放Cubism SDK   Cubism SDKの解放
    CubismFramework.dispose();
  }

  /**
   * 実行処理。
   */
  public run(): void {
    // 主循环  メインループ
    const loop = (): void => {
      // 确认是否存在实例  インスタンスの有無の確認
      if (s_instance == null) {
        return;
      }

      // 時間更新
      LAppPal.updateTime();

      // 画面の初期化
      gl.clearColor(0.0, 0.0, 0.0, 0.0);

      // 启用深度测试  深度テストを有効化
      gl.enable(gl.DEPTH_TEST);

      // 附近的物体会掩盖远处的物体     近くにある物体は、遠くにある物体を覆い隠す
      gl.depthFunc(gl.LEQUAL);

      // 清除颜色缓冲区和深度缓冲区    カラーバッファや深度バッファをクリアする
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

      gl.clearDepth(1.0);

      // 透過設定
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

      // 描画更新
      this._view.render();

      // 循环的递归调用    ループのために再帰呼び出し
      requestAnimationFrame(loop);
    };
    loop();
  }

  /**
   * 注册着色器。  シェーダーを登録する。
   */
  public createShader(): WebGLProgram {
    // 编译条形着色器   バーテックスシェーダーのコンパイル
    const vertexShaderId = gl.createShader(gl.VERTEX_SHADER);

    if (vertexShaderId == null) {
      LAppPal.printMessage('failed to create vertexShader');
      return null;
    }

    const vertexShader: string =
      'precision mediump float;' +
      'attribute vec3 position;' +
      'attribute vec2 uv;' +
      'varying vec2 vuv;' +
      'void main(void)' +
      '{' +
      '   gl_Position = vec4(position, 1.0);' +
      '   vuv = uv;' +
      '}';

    gl.shaderSource(vertexShaderId, vertexShader);
    gl.compileShader(vertexShaderId);

    // 编译碎片着色器  フラグメントシェーダのコンパイル
    const fragmentShaderId = gl.createShader(gl.FRAGMENT_SHADER);

    if (fragmentShaderId == null) {
      LAppPal.printMessage('failed to create fragmentShader');
      return null;
    }

    const fragmentShader: string =
      'precision mediump float;' +
      'varying vec2 vuv;' +
      'uniform sampler2D texture;' +
      'void main(void)' +
      '{' +
      '   gl_FragColor = texture2D(texture, vuv);' +
      '}';

    gl.shaderSource(fragmentShaderId, fragmentShader);
    gl.compileShader(fragmentShaderId);

    // 创建程序对象   プログラムオブジェクトの作成
    const programId = gl.createProgram();
    gl.attachShader(programId, vertexShaderId);
    gl.attachShader(programId, fragmentShaderId);

    gl.deleteShader(vertexShaderId);
    gl.deleteShader(fragmentShaderId);

    // 链接  リンク
    gl.linkProgram(programId);

    gl.useProgram(programId);

    return programId;
  }

  /**
   * View情報を取得する。
   */
  public getView(): LAppView {
    return this._view;
  }

  public getTextureManager(): LAppTextureManager {
    return this._textureManager;
  }

  /**
   * 构造函数  コンストラクタ
   */
  constructor() {
    this._captured = false;
    this._mouseX = 0.0;
    this._mouseY = 0.0;
    this._isEnd = false;

    this._cubismOption = new Option();
    this._view = new LAppView();
    this._textureManager = new LAppTextureManager();
  }

  /**
   * 初始化Cubism SDK  Cubism SDKの初期化
   */
  public initializeCubism(): void {
    // setup cubism
    this._cubismOption.logFunction = LAppPal.printMessage;
    this._cubismOption.loggingLevel = LAppDefine.CubismLoggingLevel;
    CubismFramework.startUp(this._cubismOption);

    // initialize cubism
    CubismFramework.initialize();

    // load model
    LAppLive2DManager.getInstance();

    LAppPal.updateTime();

    this._view.initializeSprite();
  }

  /**
   * 调整画布大小以填充屏幕。 Resize the canvas to fill the screen.
   */
  private _resizeCanvas(): void {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  _cubismOption: Option; // Cubism SDK Option
  _view: LAppView; // View情報
  _captured: boolean; // 是否单击 クリックしているか
  _mouseX: number; // 鼠标X坐标  マウスX座標
  _mouseY: number; // 鼠标Y坐标  マウスY座標
  _isEnd: boolean; // APP是否结束  APP終了しているか
  _textureManager: LAppTextureManager; // 纹理管理器 テクスチャマネージャー
}

/**
 * 点击时被叫。 クリックしたときに呼ばれる。
 */
function onClickBegan(e: MouseEvent): void {
  if (!LAppDelegate.getInstance()._view) {
    LAppPal.printMessage('view notfound');
    return;
  }
  LAppDelegate.getInstance()._captured = true;

  const posX: number = e.pageX;
  const posY: number = e.pageY;

  LAppDelegate.getInstance()._view.onTouchesBegan(posX, posY);
}

/**
 * 当鼠标指针移动时被称为。マウスポインタが動いたら呼ばれる。
 */
function onMouseMoved(e: MouseEvent): void {
  if (!LAppDelegate.getInstance()._captured) {
    return;
  }

  if (!LAppDelegate.getInstance()._view) {
    LAppPal.printMessage('view notfound');
    return;
  }

  const rect = (e.target as Element).getBoundingClientRect();
  const posX: number = e.clientX - rect.left;
  const posY: number = e.clientY - rect.top;

  LAppDelegate.getInstance()._view.onTouchesMoved(posX, posY);
}

/**
 * 点击结束后被叫。 クリックが終了したら呼ばれる。
 */
function onClickEnded(e: MouseEvent): void {
  LAppDelegate.getInstance()._captured = false;
  if (!LAppDelegate.getInstance()._view) {
    LAppPal.printMessage('view notfound');
    return;
  }

  const rect = (e.target as Element).getBoundingClientRect();
  const posX: number = e.clientX - rect.left;
  const posY: number = e.clientY - rect.top;

  LAppDelegate.getInstance()._view.onTouchesEnded(posX, posY);
}

/**
 * 触摸的时候被叫。 タッチしたときに呼ばれる。
 */
function onTouchBegan(e: TouchEvent): void {
  if (!LAppDelegate.getInstance()._view) {
    LAppPal.printMessage('view notfound');
    return;
  }

  LAppDelegate.getInstance()._captured = true;

  const posX = e.changedTouches[0].pageX;
  const posY = e.changedTouches[0].pageY;

  LAppDelegate.getInstance()._view.onTouchesBegan(posX, posY);
}

/**
 * 被称为天鹅。スワイプすると呼ばれる。
 */
function onTouchMoved(e: TouchEvent): void {
  if (!LAppDelegate.getInstance()._captured) {
    return;
  }

  if (!LAppDelegate.getInstance()._view) {
    LAppPal.printMessage('view notfound');
    return;
  }

  const rect = (e.target as Element).getBoundingClientRect();

  const posX = e.changedTouches[0].clientX - rect.left;
  const posY = e.changedTouches[0].clientY - rect.top;

  LAppDelegate.getInstance()._view.onTouchesMoved(posX, posY);
}

/**
 * 触摸结束后被叫。 タッチが終了したら呼ばれる。
 */
function onTouchEnded(e: TouchEvent): void {
  LAppDelegate.getInstance()._captured = false;

  if (!LAppDelegate.getInstance()._view) {
    LAppPal.printMessage('view notfound');
    return;
  }

  const rect = (e.target as Element).getBoundingClientRect();

  const posX = e.changedTouches[0].clientX - rect.left;
  const posY = e.changedTouches[0].clientY - rect.top;

  LAppDelegate.getInstance()._view.onTouchesEnded(posX, posY);
}

/**
 * 被称为触摸被取消。 タッチがキャンセルされると呼ばれる。
 */
function onTouchCancel(e: TouchEvent): void {
  LAppDelegate.getInstance()._captured = false;

  if (!LAppDelegate.getInstance()._view) {
    LAppPal.printMessage('view notfound');
    return;
  }

  const rect = (e.target as Element).getBoundingClientRect();

  const posX = e.changedTouches[0].clientX - rect.left;
  const posY = e.changedTouches[0].clientY - rect.top;

  LAppDelegate.getInstance()._view.onTouchesEnded(posX, posY);
}
