<?php

namespace App\Api\Chat;

use CodeIgniter\RESTful\ResourceController;
use CodeIgniter\Files\File;

class Channels extends ResourceController
{
    protected $modelName = 'App\Models\ChannelModel';
    protected $format    = 'json';

    public function addChannel()
    {
        $data = $this->request->getPost();
        $id = $this->model->addChannel($data);
        return $this->respond(array_merge(['_id' => $id], $data), 200);
    }

    public function updateChannelMembers()
    {
        $data = $this->request->getPost();
        $this->model->updateChannelMembers($data);
        return $this->respond($data, 200);
    }


    public function updateChannel()
    {
        $data = $this->model->updateChannel($this->request->getPost());
        return $this->respond(200);
    }

    public function addChannelSettings()
    {
        $this->model->addChannelSettings($this->request->getPost());
        return $this->respondCreated(200);
    }

    public function archiveChannel()
    {
        $data = $this->model->archiveChannel($this->request->getPost());
        return $this->respond($data, 200);
    }


    public function deleteChannelMessage()
    {
        $_messageID = $this->request->getPost();
        $this->model->deleteChannelMessage($_messageID);

        return $this->respondDeleted($_messageID);
    }

    public function getTotalChannelMessages()
    {
        $data = $this->model->getTotalChannelMessages($this->request->getVar("_channelID"));
        return $this->respond($data);
    }



    public function getChannelMembers()
    {
        $data = $this->model->getChannelMembers($this->request->getVar("_channelID"));
        return $this->respond($data, 200);
    }

    public function addChannelMessage()
    {
        $data = $this->request->getPost();
        $_id = $this->model->addChannelMessage($data);

        return $this->respond(array_merge(["_id" => $_id], $data), 200);
    }

    public function addChannelMessageThread()
    {
        $data = $this->request->getPost();
        $_id = $this->model->addChannelMessageThread($data);

        return $this->respond(array_merge(["_id" => $_id], $data), 200);
    }

    public function updateChannelMessage()
    {
        $data = $this->request->getPost();
        $_id = $this->model->updateChannelMessage($data);

        return $this->respond(array_merge(["_id" => $_id], $data), 200);
    }

    public function getChannels()
    {
        $data = $this->model->getChannels($this->request->getVar('_uuid'));
        return $this->respond($data, 200);
    }

    public function getChannelMessages()
    {
        $data = $this->model->getChannelMessages($this->request->getVar('_channelID'), $this->request->getVar('limit'), $this->request->getVar('offset'));
        return $this->respond($data, 200);
    }

    public function channelupload()
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

    public function download()
    {
        $name = $this->request->getVar('name');
        $path = str_replace(base_url(), ROOTPATH . "public/", $this->request->getVar('path'));
        return $this->response->download($path, null)->setFileName($name);
    }

    public function updateMessageReaction()
    {
        $data = $this->request->getPost();
        $_id = $this->model->updateMessageReaction($data);
        return $this->respond(array_merge(["_id" => $_id], $data), 200);
    }
}
