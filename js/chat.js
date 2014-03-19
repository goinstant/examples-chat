/* jshint browser:true */

$(function() {
'use strict';

  var $ = window.$;
  var _ = window._;
  var goinstant = window.goinstant;

  var url = 'YOUR CONNECT URL HERE';

  var conn;
  var room;
  var user;
  var messagesKey;

  var $auth = $('.auth');
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
    var $message = $('<li><div class="user-name"></div>' +
                     '<div class="user-message"></div></li>');

    $message.addClass('message');

    $message.children().first().text(message.name);
    $message.children().last().text(message.text);

    $messages.append($message);

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
      text: $text.val()
    };

    if (message.name === '' || message.text === '') {
      return;
    }

    messagesKey.add(message);
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
      $li.attr('class', provider.toLowerCase());

      var $link = $('<a><span>' + provider + '</span></a>');
      $link.attr('href', conn.loginUrl(apiId));

      $link.prepend('<span class="icon"></span>');
      $li.append($link);

      $list.append($li);
    });

    $auth.append('<h3>Login with</h3>');
    $auth.append($list);
  }

  function displayLogOut() {
    var $btn = $('<div></div>');
    var $link = $('<a><span>Logout</span></a>');

    $link.attr('href', conn.logoutUrl());
    $btn.attr('class', 'logout');
    $link.prepend('<span class="icon"></span>');
    $btn.append($link);

    $auth.append($btn);
  }

  function scrollBottom() {
    var properties = {
      scrollTop: $messages[0].scrollHeight
    };

    $messages.animate(properties, 'slow');
  }

  var _scrollBottom = _.debounce(scrollBottom, 100);
});
