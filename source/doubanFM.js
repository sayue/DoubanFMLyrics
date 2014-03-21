function DoubanFM(){
	this.name = 'FM';
	this.tmp_song_id = '';
	this.flag = 1;
	this.lyrics = this.draw_lyrics();
}

DoubanFM.prototype.draw_lyrics = function() {
	var lyrics_div = document.createElement('span');//用document.createElement()方法可以创造新的节点
	document.getElementById("fm-channel-list").appendChild(lyrics_div);//用document.body.appendChild()方法把新的节点附加到到document中
	//设置css样式
	lyrics_div.style.width = '230px';
	lyrics_div.style.zIndex = '10000';
	lyrics_div.style.position = 'absolute';
	lyrics_div.style.left="50px";
	lyrics_div.style.top="10px";
	lyrics_div.style.color="rgb(36, 158, 99)";
	lyrics_div.align="center";
	//返回歌词div
	return lyrics_div;	
}

//构造查询歌词url
DoubanFM.prototype.geci_entry_url = function(song, artist) {
	if (song == undefined || song == null || song == '') 
		return '';
	var url = 'http://geci.me/api/lyric/' + song;
	if (!(artist == undefined || artist == null || artist == '')) {
		url += '/' + artist;
	}
	//若歌曲为两人重新翻唱版本，则按歌名查询
	if(artist.indexOf("/") !== -1){
		url = 'http://geci.me/api/lyric/' + song;
	}
	//console.log(url);
	//返回查询歌词url
	return url;
}

//通过localStorage获取歌曲信息，构造完url后，再发送Ajax请求
DoubanFM.prototype.request_geci = function() {
	eval('var stored_song = ' + localStorage['bubbler_song_info']);//localStorage对象 HTML5
	//去除歌名的括号
	var start_from = stored_song.song_name.indexOf("(");
	if(start_from !== -1){
		stored_song.song_name = stored_song.song_name.substring(0,start_from);
	}

	//console.log('the song in localStorage:' + stored_song.artist + ' ' + stored_song.song_name);
	if (this.tmp_song_id != stored_song.id) {
		//console.log(this.tmp_song_id + ' is not ' + stored_song.id);
		var url = this.geci_entry_url(stored_song.song_name, stored_song.artist);
		this.tmp_song_id = stored_song.id;
		this.ajax_get(url);
	}
}

//发送Ajax请求
DoubanFM.prototype.ajax_get = function(url) {
	var XHR = new XMLHttpRequest();
	var obj = this;
	//一次典型的原生js发起的AJAX请求
	XHR.onreadystatechange = function() {
	if (XHR.readyState == 4) {
		if (XHR.status == 200) {
			obj.deal_response(XHR.responseText);
		} else {
			obj.print_lyrics('获取歌词失败!');
		}
	} else {
			obj.print_lyrics('歌词搜索中...');
		}
	}
 
	XHR.open('GET', url, true);
	XHR.send(null);
}

DoubanFM.prototype.deal_response = function(data) {
	if (this.flag == 1) {
		eval('var resp = ' + data);
	if (resp.count > 0) {
		this.ajax_get(resp.result[0].lrc);
		this.flag++;
	} else {
			this.print_lyrics('没有找到歌词');
		}
	} else {
		this.print_lyrics(this.format(data));
		this.flag = 1;
	}
}

DoubanFM.prototype.format = function(text) {
	var s = text.replace(/\[(.*)\]/g, '').trim();//去除返回数据的[]两端的内容，只保留歌词部分
	return s.replace(/\n/g, '\n<br />');//每行末尾输出html的换行符
}

DoubanFM.prototype.print_lyrics = function(text) {
	this.lyrics.innerHTML = text; 
}
var fm = new DoubanFM(true);
window.setInterval(function() { fm.request_geci(); }, 1000);