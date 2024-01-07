<?php

use CodeIgniter\Router\RouteCollection;

/**
 * @var RouteCollection $routes
 */

$routes->get("/", "Home::index");
// Chat
$routes->group("api/chat", ["namespace" => "App\Api\Chat"], static function ($routes) {
    // session
    $routes->get("getSession", "Chat::getSession");
    $routes->post("updateSession", "Chat::updateSession");
    $routes->post("addSession", "Chat::AddSession");
    $routes->post("restoreSession", "Chat::restoreSession");

    // User
    $routes->post("createUser", "Chat::createUser");
    $routes->post("updateUserSettings", "Chat::updateUserSettings");
    $routes->post("updateUser", "Chat::updateUser");
    $routes->post("clearDownloads", "Chat::clearDownloads");
    $routes->get("getUser", "Chat::getUser");
    $routes->get("getAllUsers", "Chat::getAllUsers");
    $routes->get("getAllChannels", "Chat::getAllChannels");
    $routes->get("getUserFilesDownloads", "Chat::getUserFilesDownloads");
    $routes->get("downloadFile", "Chat::downloadFile");

    // Messages
    $routes->get("directmessages/getUserDirectMessages", "DirectMessages::getUserDirectMessages");
    $routes->get("directmessages/getMessageThread", "DirectMessages::getMessageThread");
    $routes->get("directmessages/getUserDirectMessageChannels", "DirectMessages::getUserDirectMessageChannels");
    $routes->get("directmessages/getUserTotalMessages", "DirectMessages::getUserTotalMessages");
    $routes->post("directmessages/addDirectMessage", "DirectMessages::addDirectMessage");
    $routes->post("directmessages/addDirectMessagesMembers", "DirectMessages::addDirectMessagesMembers");
    $routes->post("directmessages/sendThreadMessage", "DirectMessages::sendThreadMessage");
    $routes->post("directmessages/updateMessage", "DirectMessages::updateMessage");
    $routes->post("directmessages/deleteMessage", "DirectMessages::deleteMessage");
    $routes->post("directmessages/updateMessageReaction", "DirectMessages::updateMessageReaction");
    $routes->post("directmessages/upload", "DirectMessages::upload");
    $routes->post("directmessages/deleteFile", "DirectMessages::deleteFile");

    // Channels
    $routes->get("channels/getChannels", "Channels::getChannels");
    $routes->get("channels/getChannelMessages", "Channels::getChannelMessages");
    $routes->get("channels/getTotalChannelMessages", "Channels::getTotalChannelMessages");
    $routes->get("channels/getChannelMembers", "Channels::getChannelMembers");
    $routes->get("channels/download", "Channels::download");
    $routes->post("channels/addChannel", "Channels::addChannel");
    $routes->post("channels/addChannelMessage", "Channels::addChannelMessage");
    $routes->post("channels/addChannelMessageThread", "Channels::addChannelMessageThread");
    $routes->post("channels/updateChannelMessage", "Channels::updateChannelMessage");
    $routes->post("channels/deleteChannelMessage", "Channels::deleteChannelMessage");
    $routes->post("channels/archiveChannel", "Channels::archiveChannel");
    $routes->post("channels/updateChannelMembers", "Channels::updateChannelMembers");
    $routes->post("channels/updateChannel", "Channels::updateChannel");
    $routes->post("channels/channelUpload", "Channels::channelUpload");
    $routes->post("channels/addChannelSettings", "Channels::addChannelSettings");
    $routes->post("channels/updateMessageReaction", "channels::updateMessageReaction");
});

// filemanager
$routes->group("api/filemanager-v2", ["namespace" => "App\Api\Filemanager"], static function ($routes) {
    $routes->post("delete", "Filemanager::delete");
    $routes->post("folder", "Filemanager::createFolder");
    $routes->post("upload", "Filemanager::upload");
    $routes->get("index", "Filemanager::index");
    $routes->get("list", "Filemanager::list");
});
