<?php

namespace App\Api\Chat;

use CodeIgniter\RESTful\ResourceController;
use CodeIgniter\Files\File;

class Chat extends ResourceController
{
    protected $modelName = "App\Models\ChatModel";
    protected $format = "json";

    public function getSession()
    {
        $data = $this->model->getSession($this->request->getVar("sessionID"));
        return $this->respond($data, 200);
    }

    public function updateSession()
    {
        $data = $this->request->getPost();
        $this->model->updateSession($data);
        return $this->respondCreated(200);
    }

    public function restoreSession()
    {
        $sessionID = $this->request->getPost("sessionID");
        $this->model->restoreSession($sessionID);
        return $this->respondCreated(200);
    }

    public function addSession()
    {
        $data = $this->request->getPost();
        $this->model->addSession($data);
        return $this->respondCreated(200);
    }

    public function getAllUsers()
    {
        return $this->respond($this->model->getAllUsers());
    }

    public function getAllChannels()
    {
        return $this->respond($this->model->getAllChannels());
    }

    public function getUser()
    {
        $data = $this->model->getUser($this->request->getVar("_uuid"));
        return $this->respond($data);
    }

    public function createUser()
    {
        $data = $this->request->getPost();

        $this->model->addUser($data);

        return $this->respondCreated($data);
    }

    public function updateUserSettings()
    {
        $data = $this->request->getPost();
        $directory = ROOTPATH . "public/images/uploads/";
        $image = $this->request->getFile("image");
        if (isset($image)) {
            $name = $image->getName();
            if (!$image->hasMoved()) {
                $image->move($directory, $name);
            }

            $data = array_merge(["image" => $file], $data);
        }

        $this->model->updateUserSettings($data);
        return $this->respond(200);
    }

    public function updateUserStatus()
    {
        $data = $this->request->getPost();
        $this->model->updateUserStatus($this->request->getVar("_uuid"), $data);
        return $this->respondCreated($data);
    }

    public function getUserFilesDownloads()
    {
        $data = $this->model->getUserFilesDownloads(
            $this->request->getVar("_uuid")
        );
        return $this->respond($data, 200);
    }

    public function downloadFile()
    {
        $path = ROOTPATH . "public/" . $this->request->getVar("path");
        $this->model->download(
            $this->request->getVar("fileID"),
            $this->request->getVar("_uuid")
        );
        return $this->response
            ->download($path, null)
            ->setFileName($this->request->getVar("name"));
    }

    public function clearDownloads()
    {
        $data = $this->request->getPost();
        $this->model->clearDownloads($data);
        return $this->respondDeleted($data);
    }
}
