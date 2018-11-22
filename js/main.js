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
  var fileInfoMap = {
    'DgXByGgVAAIzdkf.png':{
      leftRate:0.05,
      topRate:0.4,
      textVertical : false,
      fontSize:50
    },
    'Dl1uV-YUwAA5kOr.png':{
      leftRate:0.55,
      topRate:0.60,
      textVertical : false,
      fontSize:90
    },
    'Dk4Po8eU0AIakS6.png':{
      leftRate:0.14,
      topRate:0.23,
      textVertical : false,
      fontSize:30
    },
    'DrzXCYhV4AAZXAa.png':{
      leftRate:0.1,
      topRate:0.2,
      textVertical : true,
      fontSize:40
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
   
    var objects = canvas.getActiveObjects();
    for(var i = 0; i < objects.length; i++) {
        canvas.remove(objects[i]);
      }
    
    canvas.renderAll();

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
    $text.val($('#file-selection option:selected').text());
    var map = fileInfoMap[$file.val()];
    $textVertical.prop('checked', map.textVertical);
    $fontSize.val(map.fontSize);
    setImage($file.val());
  });

  /**
   * ダウンロード
   */
  $download.on('click', function(){
    unSelect();
    saveCanvas('png', $file.val());
  });

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
    var array = canvas.getObjects();
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
   * 全選択解除
   */
  var unSelect = function() {
    canvas.discardActiveObject();
    canvas.renderAll();
  };

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
      var newText = new fabric.Text(array[i]);
      newText.set({
        left: posX,
        top: posY,
        fontFamily : $('#font-selection option:selected').val(),
        fontSize : $fontSize.val(),
        fill : getFontColor(),
      });
      

      textList.push(newText);
      if(isVertical) {
        // 縦書き
        posY += getTextWidth(array[i]);
      } else {
        // 横書き
        posX += getTextWidth(array[i]);
      }
      
      if(isVertical && array[i].match(/[\u30FC\u2010-\u2015\u2212\uFF70-]/)){
        // 縦棒を縦書きにするための小細工
        newText.set({
          angle: 90,
          left: posX + getTextWidth(array[i])
        });
      }
    }

    var group = new fabric.Group(textList, {
      left: initPosX,
      top: initPosY
    });

    canvas.add(group);
  };

  /**
   * 文字列追加
   * @param {*} x 
   * @param {*} y 
   */
  var addText = function(x, y) {
    createText($text.val(), x, y, $textVertical.prop('checked'));
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
        selectable: false,
        scaleX : scaleX,
        scaleY : scaleY,
      });

      canvas.setWidth(width);
      canvas.setHeight(height);

      canvas.clear()
      canvas.add(img);
      var pos = fileInfoMap[file];
      addText(width * pos.leftRate, height * pos.topRate);
    });

    canvas.clear()
    canvas.add(fabricImage);
    canvas.add(lgtmText);
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
   * オブジェクト選択イベント
   */
  canvas.on('selection:created', function(options){
    selectedObject = options.target;
  });

  /**
   * オブジェクト選択解除イベント
   */
  canvas.on('selection:cleared', function(options){
    selectedObject = null;
  });

  // 初期化
  $file.val($file.children().first().attr('value'));
  $text.val($file.children().first().text());
  $textVertical.prop('checked', false);
  $fontSize.val(fileInfoMap[$file.children().first().attr('value')].fontSize);
  setImage($file.children().first().attr('value'));
});