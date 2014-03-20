/* jshint browser:true */

$(function() {
'use strict';

  var $ = window.$;
  var _ = window._;
  var goinstant = window.goinstant;

  var url = 'CONNECT_URL_HERE';

  var conn;
  var room;
  var user;
  var messagesKey;

  var $auth = $('.auth');
  var $avatar = $('.avatar');
  var $name = $('.name');
  var $text = $('.text');
  var $messages = $('.messages');

  var connect = goinstant.connect(url);

  connect.then(function(result) {
    conn = result.connection;
    room = result.rooms[0];
    messagesKey = room.key('messages');

    return room.self().get();

  }).then(function(result) {
    user = result.value;

    if (conn.isGuest()) {
      displayLogin();

    } else {
      displayLogOut();
    }

    $name.val(user.displayName);

    if (user.avatarUrl) {

      var $img = $('<img />');
      $img.attr('src', user.avatarUrl);

      $avatar.append($img);
    }

    return messagesKey.get();

  }).then(function(result) {
    var messages = result.value;
    var ordered = _.keys(messages).sort();

    _.each(ordered, function(id) {
      addMessage(messages[id]);
    });

  }).fin(function() {
    var options = {
      local: true
    };

    messagesKey.on('add', options, addMessage);
    $text.on('keydown', handleMessage);
  });

  function addMessage(message, context) {
    var $li = $('<li></li>');
    $li.addClass('message');

    var $img = $('<div class="avatar"><img /></div>').find('img');
    $img.attr('src', message.avatar || '/img/avatar.png');

    var $name = $('<div class="user-name"></div>').text(message.name);
    var $message = $('<div class="user-message"></div>').text(message.text);

    $li.append($img);
    $li.append($name);
    $li.append($message);
    $messages.append($li);

    _scrollBottom();

    if (context && context.userId === user.id) {
      $text.val('');
    }
  }

  function handleMessage(event) {
    if (event.which !== 13) {
      return;
    }

    var message = {
      name: $name.val(),
      text: $text.val(),
      avatar: user.avatarUrl
    };

    if (message.name === '' || message.text === '') {
      return;
    }

    var options = {
      expire: 48 * 60 * 60 * 1000 // 48 hours
    };

    messagesKey.add(message, options);
  }

  function displayLogin() {
    var $list = $('<ul></ul>');
    var providers = {
      Twitter: 'twitter',
      GitHub: 'github',
      Salesforce: 'forcedotcom',
      Google: 'google',
      Facebook: 'facebook'
    };

    _.each(providers, function(apiId, provider) {
      var $li = $('<li></li>');
      $li.attr('class', apiId);

      var $link = $('<a><span></span></a>');
      $link.find('span').text(provider);

      $link.attr('href', conn.loginUrl(apiId));

      $link.prepend('<span class="icon"></span>');
      $li.append($link);

      $list.append($li);
    });

    $auth.append('<h3>Login with</h3>');
    $auth.append($list);
    $auth.addClass('login');
  }

  function displayLogOut() {
    var $provider = $('<div><span class="icon"></span></div>');
    $provider.addClass('provider-icon');
    $provider.addClass(user.provider);

    var $link = $('<a><span>Logout</span></a>');

    $link.attr('href', conn.logoutUrl());

    $link.attr('class', 'button');
    $link.prepend('<span class="icon"></span>');

    $auth.append($provider);
    $auth.append($link);
    $auth.addClass('logout');
  }

  function scrollBottom() {
    var properties = {
      scrollTop: $messages[0].scrollHeight
    };

    $messages.animate(properties, 'slow');
  }

  var _scrollBottom = _.debounce(scrollBottom, 100);
});
