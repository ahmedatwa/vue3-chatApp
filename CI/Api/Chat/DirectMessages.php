<?php

namespace App\Api\Chat;

use CodeIgniter\RESTful\ResourceController;
use CodeIgniter\Files\File;

class DirectMessages extends ResourceController
{
    protected $modelName = 'App\Models\DirectMessageModel';
    protected $format    = 'json';

    public function getUserDirectMessages()
    {

        $data = $this->model->getUserDirectMessages($this->request->getVar("_channelID"), $this->request->getVar("limit"), $this->request->getVar("offset"));
        return $this->respond($data);
    }

    public function getUserTotalMessages()
    {

        $data = $this->model->getUserTotalMessages($this->request->getVar("_channelID"));
        return $this->respond($data);
    }

    public function getUserDirectMessageChannels()
    {

        $data = $this->model->getUserDirectMessageChannels($this->request->getVar("_uuid"));
        return $this->respond($data);
    }

    public function addDirectMessage()
    {
        $data = $this->request->getPost();
        $_id = $this->model->addDirectMessage($data);
        return $this->respond(array_merge(["_id" => $_id], $data), 200);
    }

    public function sendThreadMessage()
    {
        $data = $this->request->getPost();
        $_id = $this->model->addDirectMessageThread($data);
        return $this->respond(array_merge(["_id" => $_id], $data), 200);
    }

    public function getMessageThread()
    {
        $data = $this->model->getMessageThread($this->request->getVar("_messageID"));
        return $this->respond($data);
    }

    public function addDirectMessagesMembers()
    {
        $data = $this->request->getPost();
        $this->model->addDirectMessagesMembers($data);
        return $this->respond($data, 200);

    }

    public function updateMessage()
    {
        $data = $this->request->getPost();
        $this->model->updateMessage($data);
        return $this->respond($data, 200);
    }

    public function deleteMessage()
    {
        $_messageID = $this->request->getPost();
        $this->model->deleteMessage($_messageID);

        return $this->respondDeleted($_messageID);
    }

    public function updateMessageReaction()
    {
        $data = $this->request->getPost();
        $_id = $this->model->updateMessageReaction($data);
        return $this->respond(array_merge(["_id" => $_id], $data), 200);
    }

    public function upload()
    {
        helper('text');
        $imagefile = $this->request->getFiles();
        $directory = ROOTPATH . 'public/images/uploads/';
        $data = [];
        $response = [];
        if(isset($imagefile["files"])) {
            foreach ($imagefile["files"] as $image) {
                $randomName = $image->getRandomName();
                $data = [
                   'name' => $image->getName(),
                   'type' => $image->getMimeType(),
                   'size' => $image->getSize(),
                   "randomName" => $randomName,
                   'path' => 'images/uploads/' . $randomName,
                   "url" => base_url('images/uploads/') . $randomName,
                   '_uuid' => $this->request->getPost('_uuid'),
                   '_channelID' => $this->request->getPost('_channelID'),
                ];

                if ($image->isValid() && !$image->hasMoved()) {
                    $image->move($directory, $randomName);
                    $_id = $this->model->upload($data);

                }
                $response[] = array_merge(["_id" => $_id], $data);
            }
        } else {
            $imagefile = $this->request->getPost();
            $data = [
               'name' => $imagefile["name"],
               'type' => $imagefile["type"],
               'size' => $imagefile["size"],
               "randomName" => $imagefile["id"],
               'url' => $imagefile["src"],
               '_uuid' => $this->request->getPost('_uuid'),
               '_channelID' => $this->request->getPost('_channelID'),
            ];
            $_id = $this->model->upload($data);
            $response[] = array_merge(["_id" => $_id], $data);
        }


        return $this->respond($response, 200);
    }



    public function deleteFile()
    {
        $data = $this->request->getPost();
        $this->model->deleteFile($data);
        return $this->respondDeleted();
    }



}
