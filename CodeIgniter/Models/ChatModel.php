<?php

namespace App\Models;

use CodeIgniter\Model;
use CodeIgniter\Database\RawSql;
use CodeIgniter\I18n\Time;

class ChatModel extends Model
{
    protected $table      = 'users';
    protected $primaryKey = '_id';

    protected $useAutoIncrement = true;

    protected $returnType     = 'array';
    protected $useSoftDeletes = true;

    protected $allowedFields = ['_uuid', 'firstName', 'lastName', "image", "email", "status"];

    // Dates
    protected $useTimestamps = true;
    protected $dateFormat    = 'datetime';
    protected $createdField  = 'createdAt';
    protected $updatedField  = 'updatedAt';
    protected $deletedField  = 'deletedAt';

    // Callbacks
    protected $allowCallbacks = false;
    protected $beforeInsert   = [];
    protected $afterInsert    = [];
    protected $beforeUpdate   = [];
    protected $afterUpdate    = [];
    protected $beforeFind     = [];
    protected $afterFind      = [];
    protected $beforeDelete   = [];
    protected $afterDelete    = [];


    // Users
    public function getAllUsers()
    {
        $data = [];
        $builder = $this->db->table('users as u');

        $builder->select('u._id, u._uuid, u.firstName, u.lastName, u.email, u.status, u.createdAt, u2c.displayName, u2c.image, u2c.settings, u2c.visible, u2c.connected, u2c.topic');
        $builder->join('chat_users_settings as u2c', "u2c._uuid = u._uuid", "Left");
        $query = $builder->get();
        foreach ($query->getResultArray() as $result) {
            $data[] = [
                "_id"       => $result["_id"],
                "_uuid"     => $result['_uuid'],
                "firstName" => $result['firstName'],
                "lastName"  => $result['lastName'],
                "email"     => $result['email'],
                "image"     => $result['image'],
                "topic"     => $result['topic'],
                "settings"     => json_decode($result['settings'], true),
                "visible" => $result['visible'] === "1" ? true : false,
                "connected" => $result['connected'] === "1" ? true : false,
                "displayName" => $result['displayName'],
                "createdAt" => $result['createdAt'],
            ];
        }

        return $data;
    }

    public function getAllChannels()
    {
        $data = [];
        $builder = $this->db->table('channels');
        $builder->select();
        $builder->where('status', 1);
        $query = $builder->get();
        return $query->getResultArray();
    }

    public function addUser(array $data)
    {
        $builder = $this->db->table('users');
        $set = [
            "_uuid" => $data["_uuid"],
            "firstName" => $data["firstName"],
            "lastName" => $data["lastName"],
            "email" => $data["email"],
            "status" => $data["status"] || 1,
        ];
        $builder->set($set);
        $builder->insert();
        $builder2 = $this->db->table('chat_users_settings');
        $builder2->set([
            "displayName" => $data["displayName"],
            "image" => isset($data["image"]) ? $data["image"] : '',
            "_uuid" => $data["_uuid"],
            "settings" => json_encode($data["settings"]),
        ]);
        $builder2->insert();
    }

    public function updateUserSettings(array $data)
    {
        $builder = $this->db->table('chat_users_settings');
        $builder->where('_uuid', $data["_uuid"]);
        $builder->set($data);
        $builder->update();
    }

    public function updateUser(string $_uuid, array $data)
    {
        $builder = $this->db->table('chat_users_settings');
        $builder->where('_uuid', $_uuid);
        $builder->set($data["key"], $data["value"] == "true" ? 1 : 0);
        $builder->update();
    }


    public function updateSession(array $data)
    {
        $builder = $this->db->table('sessions');
        $builder->where('_uuid', $data['_uuid']);
        $builder->set('connected', $data["connected"] == "true" ? 1 : 0);
        $builder->set("deletedAt", Time::now()->toDateTimeString());
        $builder->update();
    }

    public function restoreSession(string $sessionID)
    {
        $builder = $this->db->table('sessions');
        $builder->where('sessionID', $sessionID);
        $builder->set('connected', 1);
        $builder->set("updatedAt", Time::now()->toDateTimeString());
        $builder->set("createdAt", Time::now()->toDateTimeString());
        $builder->update();
    }

    public function addSession(array $data)
    {
        $builder = $this->db->table('sessions');
        $builder->delete(["_uuid" => $data['_uuid']]);
        $data = [
           '_uuid'     => $data['_uuid'],
           'sessionID' => $data['sessionID'],
           'connected' => $data['connected'] == "true" ? 1 : 0,
        ];
        $builder->set($data);
        $builder->insert();
    }

    public function getSession(string $sessionID)
    {

        $data = [];
        $builder = $this->db->table('sessions as s');
        $builder->select('u._id, u.firstName, u.lastName, u.email, s.connected, s.sessionID, s._uuid, s.createdAt, u2c.displayName, u2c.image, u2c.settings, u2c.topic');
        $builder->join('users as u', 'u._uuid = s._uuid', "LEFT");
        $builder->join('chat_users_settings as u2c', 'u2c._uuid = s._uuid', "LEFT");
        $builder->where([
            "s.sessionID" =>  $sessionID,
            "s.connected" => 1,
            "s.createdAt <"  => Time::now()->addDays(7)->toDateTimeString(),
            ]);
        $row = $builder->get()->getRowArray();
        $data = [
         "_id"       => $row["_id"],
         "_uuid"     => $row['_uuid'],
         "firstName" => $row['firstName'],
         "lastName"  => $row['lastName'],
         "email"     => $row['email'],
         "image"     => $row['image'],
         "topic"     => $row["topic"],
         "settings"     => json_decode($row['settings'], true),
         "connected" => $row['connected'] = 1 ? true : false,
         "sessionID" => $row['sessionID'],
         "displayName" => $row['displayName'],
         "createdAt" => $row['createdAt'],
        ];

        return $data;

    }

    public function getUser(string | array $_uuid)
    {

        $builder = $this->db->table("users as u");
        $builder->select("s.connected, u._id, u._uuid, u.firstName, u.lastName, u.email, u.createdAt, u2c.displayName, u2c.image, u2c.settings");

        if(!is_array($_uuid)) {
            $builder->where("u._uuid", $_uuid);
        } else {
            $builder->whereIn("u._uuid", $_uuid);
        }
        $builder->join("sessions as s", "s._uuid = u._uuid", "left");
        $builder->join("chat_users_settings as u2c", "u2c._uuid = u._uuid", "left");

        $query = $builder->get();
        return $query->getResultArray();
    }

    public function getUserFilesDownloads(string $_uuid)
    {
        $builder = $this->db->table("user_downloads as ud");
        $builder->select("ud.file_id as _id, dmf._uuid, dmf.name, dmf.createdAt, dmf.path");
        $builder->where([
            "ud._uuid" => $_uuid,
            "dmf.path !=" => null 
            ]);
        $builder->join("direct_messages_files as dmf", "dmf._id = ud.file_id", "left");
        //$builder->join("channel_messages_files as cmf", "cmf._id = ud.file_id", "left");
        $query = $builder->get();
        return $query->getResultArray();
    }

    public function download(string $fileID, string $_uuid)
    {
        $builder = $this->db->table("user_downloads");
        $builder->set("file_id", $fileID);
        $builder->set("_uuid", $_uuid);
        $builder->insert();
    }

    public function clearDownloads(array $data)
    {
        $builder = $this->db->table("user_downloads");
        $builder->delete(["_uuid" => $data["_uuid"]]);
    }

    // --------------------------
}
