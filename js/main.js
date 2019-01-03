var maxWidth = 640

$(function(){
  var canvas = new fabric.Canvas('canvas');
  var $download = $('#download_button');
  var $text = $('#text');
  var $fillColor =  $('#fill-color');
  var $addTextButton = $('#text-add');
  var $removeTextButton = $('#text-remove');
  var $removeAllTextButton = $('#text-all-remove');
  var $textVertical = $('#text-vertical');
  var $file = $('#file-selection');
  var $fontFamily = $('#font-selection');
  var $fontSize = $('#font-size');
  var $reverse = $('#image-reverse');
  var $addFukidashi = $('#add_fukidashi');
  var $selectFukidashi = $('select[name=fukidashi]');
  var $addOptionalImage = $('#add-optional-image');
  var _clipboard = null;
  var $copyButton = $('#copy-button');
  var $pasteButton = $('#paste-button');
  var $widthNumber = $('#width');
  var $heightNumber = $('#height');
  var $frontButton = $('#front-button');
  var $backButton = $('#back-button');

  var fileInfoMap = {
    '狐じゃい.png':{
      leftRate:0.05,
      topRate:0.4,
      textVertical : false,
      fontSize:50,
      angle:0,
      text:'狐じゃい'
    },
    'ヨシ.png':{
      leftRate:0.15,
      topRate:0.25,
      textVertical : false,
      fontSize:30,
      angle:0,
      text:'ヨシ'
    },
    '茶葉.png':{
      leftRate:0.55,
      topRate:0.6,
      textVertical : false,
      fontSize:90,
      angle:-5,
      text:'茶葉'
    },
    '素人は黙っとれ.png':{
      leftRate:0.1,
      topRate:0.2,
      textVertical : true,
      fontSize:40,
      angle:0,
      text:'素人は黙っとれ――'
    },
    'フロムで魂全部溶かす狐の顔.png':{
      leftRate:0.1,
      topRate:0.2,
      textVertical : true,
      fontSize:40,
      angle:0,
      text:''
    },
    'プラカード_あやめちゃん.png':{
      leftRate:0.13,
      topRate:0.25,
      textVertical : false,
      fontSize:80,
      angle:-20,
      text:''
    },
    'プラカード_ちょこ先生.png':{
      leftRate:0.29,
      topRate:0.2,
      textVertical : false,
      fontSize:80,
      angle:8,
      text:''
    },
    'プラカード_スバルちゃん.png':{
      leftRate:0.5,
      topRate:0.15,
      textVertical : false,
      fontSize:80,
      angle:20,
      text:''
    },
    '食いたい.png':{
      leftRate:0.0,
      topRate:0.0,
      textVertical : true,
      fontSize:30,
      angle:0,
      text:''
    }
  };


  /**
   * 追加ボタンクリックイベント
   */
  $addTextButton.on('click', function(){
    addText(0, 0);
  });

  /**
   * 削除ボタンクリックイベント
   */
  $removeTextButton.on('click', function(){
    deletefunction();
  });

  /**
   * 全削除クリックイベント
   */
  $removeAllTextButton.on('click', function(){
    removeAllText();
  });

  /**
   * 画像選択
   */
  $file.on('change', function(e){
    if(fileInfoMap[$file.val()]) {
      var map = fileInfoMap[$file.val()];
      $text.val(map.text);
      $textVertical.prop('checked', map.textVertical);
      $fontSize.val(map.fontSize);
      setImage($file.val());

    } else {
      $text.val("");
      canvas.clear();
    }
  });

  /**
   * ダウンロード
   */
  $download.on('click', function(){
    unSelect();
    saveCanvas('png', $file.val());
  });

  /**
   * 削除処理
   */
  var deletefunction = function(){
   
    var objects = canvas.getActiveObjects();
    for(var i = 0; i < objects.length; i++) {
        canvas.remove(objects[i]);
    }
    
    canvas.renderAll();
  };
  /**
   * 文字色取得
   */
  var getFontColor = function() {
    return colorCodeToRGBString($fillColor.val());
  };

  /**
   * 文字色変更
   */
  $fillColor.on('change', function(){
    var array = canvas.getActiveObjects();
    for(var i = 0; i < array.length; i++){
      if(array[i] instanceof fabric.Group) {
        var g = array[i];
        for(var j = 0; j < g.size(); j++) {
          g.item(j).setColor(getFontColor());
        }
      }
    }
    canvas.renderAll();
  });

  /**
   * 画像左右反転
   */
  $reverse.on('click', function(){
    canvas.item(0).set({flipX:!canvas.item(0).get('flipX')});
    canvas.renderAll();
  });

  /**
   * 画像追加ボタン
   */
  $addOptionalImage.on('change', function(e){
    var imageReader = new FileReader;
    imageReader.onload = function(e){
      var image = new Image;
      image.onload = function(){
        var fabricImage = new fabric.Image(image);
        // Fabric.jsのImageオブジェクトを作成
        fabricImage.set({
          left: 0,
          top: 0,
          scaleX:  0.3,
          scaleY:  0.3,
        });
        // 画像をcanvasに追加（描画）する
        canvas.add(fabricImage);
      };
      image.src = e.target.result;
    };
    imageReader.readAsDataURL(e.target.files[0]);
    canvas.renderAll();
  });

  /**
   * 全選択解除
   */
  var unSelect = function() {
    canvas.discardActiveObject();
    canvas.renderAll();
  };

  /**
   * セリフ枠追加
   */
  $addFukidashi.on('click', function(){
    addImage($selectFukidashi.val(), {
      scaleX : 0.3,
      scaleY : 0.3
    });
  });

  /**
   * コピーボタン
   */
  $copyButton.on('click', function(){
    copy();
  });

  /**
   * 貼り付けボタン
   */
  $pasteButton.on('click', function(){
    paste();
  });

  /**
   * 幅変更ボタン
   */
  $widthNumber.on('change', function(){
    canvas.setWidth($widthNumber.val());
  });

  /**
   * 高さ変更ボタン
   */
  $heightNumber.on('change', function(){
    canvas.setHeight($heightNumber.val());
  });

  /**
   * 最前面へ移動ボタン
   */
  $frontButton.on('click', function(){
    toFront();
  });

  /**
   * 最背面へ移動ボタン
   */
  $backButton.on('click', function(){
    toBack();
  });

  /**
   * フォント文字列取得
   */
  var getFontString = function() {
    return $fontSize.val() + 'px ' + $('#font-selection option:selected').val(); 
  };

  /**
   * 文字列幅取得
   * @param {*} text 文字列
   */
  var getTextWidth = function(text) {
    var ctx = document.getElementById("canvas");
    var context = ctx.getContext("2d") ;
    // フォントの条件を設定
    context.font = getFontString();

    // 幅を取得
    return context.measureText(text).width;
  };

  /**
   * 文字全削除
   */
  var removeAllText = function() {
    var array = canvas.getObjects();
    for(var i = 0; i < array.length; i++){
      if(array[i] instanceof fabric.Group) {
        canvas.remove(array[i]);
      }
    }
    canvas.renderAll();
  };

  /**
   * 全角化
   * @param {*} value 文字 
   */
  var toFullWidth = function(value) {
    if (!value) return value;
    return String(value).replace(/[!-~]/g, function(all) {
        return String.fromCharCode(all.charCodeAt(0) + 0xFEE0);
    });
  };
  
  /**
   * 文字作成
   * @param {*} text 文字
   * @param {*} initPosX 初期位置X
   * @param {*} initPosY 初期位置Y
   * @param {*} isVertical 縦書きフラグ
   */
  var createText = function(text, initPosX, initPosY, isVertical) {
    var posX = initPosX;
    var posY = initPosY;
    var textList = [];
    var array = text.split("");
    for (var i = 0; i < array.length; i++) {
      if(array[i].match(/[a-zA-Z0-9!-/:-@¥[-`{-~]/)) {
        array[i] = toFullWidth(array[i]);
      }

      var newText = new fabric.Text(array[i]);

      textList.push(newText);

      if(isVertical) {
        // 縦書き
        posY += getTextWidth(array[i]);
      } else {
        // 横書き
        posX += getTextWidth(array[i]);
      }

      newText.set({
        left: posX,
        top: posY,
        fontFamily : $('#font-selection option:selected').val(),
        fontSize : $fontSize.val(),
        fill : getFontColor(),
      });

      if(isVertical) {
        if(array[i].match(/[\uff08\uff09\uff5f\uff60\u300c\u300d\u300e\u300f\uFE43\uFE44\u005B\u005D\uFF3B\uFF3D\u301A\u301B\u27E6\u27E7\u007B\u007D\uFF5B\uFF5D\u3014\u3015\u2772\u2773\u3018\u3019\u27EC\u27ED\u3008\u3009\u300A\u300B\u27EA\u27EB\u00AB\u00BB\u2039\u203A\u003C\u003E\uFF1C\uFF1E\u226A\u226B\u3010\u3011\u3016\u3017]/)){
          // 括弧を縦書きにするための小細工
          newText.set({
            angle: 90,
            left : posX + getTextWidth("あ"),
          });
        } else if(array[i].match(/[\u3002\uff61\ufe12]/)){
          // 句点を縦書きにするための小細工
          newText.set({
            angle: -90,
            top: posY + $fontSize.val() / 2,
          });
        } else if(array[i].match(/[\u3001\uff64\u002e\uff0e]/)){
          // 読点を縦書きにするための小細工
          newText.set({
            angle: -180,
            left : posX + getTextWidth(array[i]),
            top : posY + getTextWidth(array[i])
          });
        } else if(array[i].match(/[\uFF5E\u02DC\u007E\u2026\u301C\u30FC\u2010-\u2015\u2212\uFF70-]/)){
          // 縦棒を縦書きにするための小細工
          newText.set({
            angle: 90,
            left: posX + getTextWidth(array[i])
          });
        }
      }
    }

    var group = new fabric.Group(textList, {
      left: initPosX,
      top: initPosY
    });

    canvas.add(group);

    return group;
  };

  /**
   * 文字列追加
   * @param {*} x 
   * @param {*} y 
   */
  var addText = function(x, y) {
    if($text.val().length > 0) {
      return createText($text.val(), x, y, $textVertical.prop('checked'));
    }
  };

  /**
   * 画像追加
   * @param {*} file ファイル
   * @param {*} opt オプション
   */
  var addImage = function(file, opt) {
    if(!file) { return; }

    fabric.Image.fromURL('img/' + file, function(img) {
      img.set(opt);
      canvas.add(img);
      img.on('moving', function(){
        img.set({opacity:0.5});
      });
      img.on('moved', function(){
        img.set({opacity:1.0});
      });
    });
  };
  /**
   * 画像設定
   * @param {*} file 
   */
  var setImage = function(file){
    if(!file) { return; }
    fabric.Image.fromURL('img/' + file, function(img) {
      var aspect = img.width / img.height;

      var width = Math.min(img.width, maxWidth);
      var height = width / aspect;
      var scaleX = width / img.width;
      var scaleY = height / img.height;
      img.set({
        scaleX : scaleX,
        scaleY : scaleY,
      });
      canvas.setWidth(Math.floor(width));
      canvas.setHeight(Math.floor(height));
      $widthNumber.val(Math.floor(width));
      $heightNumber.val(Math.floor(height));
      canvas.clear()
      canvas.backgroundImage = img;
      var map = fileInfoMap[file];
      var group = addText(width * map.leftRate, height * map.topRate);

      group.angle = map.angle;
    });
  };



  /**
   * canvas上のイメージを保存
   * @param {*} saveType 
   * @param {*} fileName 
   */
  var saveCanvas = function(saveType, fileName){
    var imageType = "image/png";
    if(saveType === "jpeg"){
        imageType = "image/jpeg";
    }
    var canvas = document.getElementById("canvas");
    // base64エンコードされたデータを取得 「data:image/png;base64,iVBORw0k～」
    var base64 = canvas.toDataURL(imageType);
    // base64データをblobに変換
    var blob = Base64toBlob(base64);
    // blobデータをa要素を使ってダウンロード
    saveBlob(blob, fileName);
  };

  /**
   * Base64データをBlobデータに変換
   * @param {*} base64 
   */
  var Base64toBlob = function(base64){
    // カンマで分割して以下のようにデータを分ける
    // tmp[0] : データ形式（data:image/png;base64）
    // tmp[1] : base64データ（iVBORw0k～）
    var tmp = base64.split(',');
    // base64データの文字列をデコード
    var data = atob(tmp[1]);
    // tmp[0]の文字列（data:image/png;base64）からコンテンツタイプ（image/png）部分を取得
    var mime = tmp[0].split(':')[1].split(';')[0];
      //  1文字ごとにUTF-16コードを表す 0から65535 の整数を取得
    var buf = new Uint8Array(data.length);
    for (var i = 0; i < data.length; i++) {
        buf[i] = data.charCodeAt(i);
    }
    // blobデータを作成
    var blob = new Blob([buf], { type: mime });
    return blob;
  };

  /**
   * 画像のダウンロード
   * @param {*} blob 
   * @param {*} fileName 
   */
  var saveBlob = function(blob, fileName){
    var url = (window.URL || window.webkitURL);
    // ダウンロード用のURL作成
    var dataUrl = url.createObjectURL(blob);
    // イベント作成
    var event = document.createEvent("MouseEvents");
    event.initMouseEvent("click", true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
    // a要素を作成
    var a = document.createElementNS("http://www.w3.org/1999/xhtml", "a");
    // ダウンロード用のURLセット
    a.href = dataUrl;
    // ファイル名セット
    a.download = fileName;
    // イベントの発火
    a.dispatchEvent(event);
  };

  /**
   * カラーコードRGB変換
   * @param {*} value 
   */
  var colorCodeToRGBString = function(value) {
    var r = parseInt(value.substr(1, 2), 16);
    var g = parseInt(value.substr(3, 2), 16);
    var b = parseInt(value.substr(5, 2), 16);
    return 'rgb(' + r + ',' + g + ',' + b + ')';
  };

  /**
   * コピー処理
   */
  var copy = function() {
    canvas.getActiveObject().clone(function(cloned) {
      _clipboard = cloned;
    });
  };

  /**
   * 貼り付け処理
   */
  var paste = function() {
    _clipboard.clone(function(clonedObj) {
      canvas.discardActiveObject();
      clonedObj.set({
        left: clonedObj.left + 10,
        top: clonedObj.top + 10,
        evented: true,
      });
      if (clonedObj.type === 'activeSelection') {
        // active selection needs a reference to the canvas.
        clonedObj.canvas = canvas;
        clonedObj.forEachObject(function(obj) {
          canvas.add(obj);
        });
        // this should solve the unselectability
        clonedObj.setCoords();
      } else {
        canvas.add(clonedObj);
      }
      _clipboard.top += 10;
      _clipboard.left += 10;
      canvas.setActiveObject(clonedObj);
      canvas.requestRenderAll();
    });
  };

  /**
   * 最前面へ移動
   */
  var toFront = function () {
    var objects = canvas.getActiveObjects();
    for(var i = 0; i < objects.length; i++) {
      objects[i].bringToFront();
    }
    canvas.requestRenderAll();
  };

  /**
   * 最背面へ移動
   */
  var toBack = function () {
    var objects = canvas.getActiveObjects();
    for(var i = 0; i < objects.length; i++) {
      objects[i].sendToBack();
    }
    canvas.requestRenderAll();
  };

  /**
   * キー押下
   */
  $(window).keydown(function(e){
    if(e.ctrlKey){
      if(e.keyCode === 67){
        // Ctrl + c
        copy();
        return false;
      } else if(e.keyCode === 86){
        // Ctrl + v
        paste();
        return false;
      }
    } else {
      if(e.keyCode == 46) {
        // Delete
        deletefunction();
        return false;
      } else if(e.keyCode === 70){
        // f
        toFront();
        return false;
      } else if(e.keyCode === 66){
        // f
        toBack();
        return false;
      }
    }
  });

  // 初期化
  var filename = $file.children().first().attr('value');
  $file.val(filename);
  $text.val(fileInfoMap[filename].text);
  $textVertical.prop('checked', false);
  $fontSize.val(fileInfoMap[filename].fontSize);
  $('select[name=fukidashi]').ImageSelect({dropdownWidth:425});
  setImage(filename);
});