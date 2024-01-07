<?php

namespace App\Models;

use CodeIgniter\Model;
use CodeIgniter\I18n\Time;

class ChannelModel extends Model
{
    protected $table      = 'users';
    protected $primaryKey = '_id';

    protected $useAutoIncrement = true;

    protected $returnType     = 'array';
    protected $useSoftDeletes = true;

    protected $allowedFields = [];

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

    public function getChannels(string $_uuid)
    {
        $data = [];
        $builder = $this->db->table('channels as c');
        $builder->select("c._id, c._channelID, c.channelName, c.channelTopic, c.channelDescription, c.channelImage, 
            c.createdBy, c.createdAt, cm.settings");
        $builder->join('channel_members as cm', "cm._channelID = c._channelID", "left");
        $builder->where('c.status', 1);
        $builder->where('cm.status', 1);
        $builder->where('cm._uuid', $_uuid);
        //$builder->join("channel_messages as cm", "cm._channelID = c._channelID", "left");

        $query = $builder->get();
        foreach($query->getResultArray() as $result) {
            $data[] = [
                "_id" => $result["_id"],
                "_channelID" => $result["_channelID"],
                "channelName" => $result["channelName"],
                "channelTopic" => $result["channelTopic"],
                "channelDescription" => $result["channelDescription"],
                "channelImage" => $result["channelImage"],
                "settings" => json_decode($result["settings"]),
                "createdBy" => $result["createdBy"],
                "createdAt" => $result["createdAt"],
                "totalMessages" => $this->getTotalChannelMessages($result["_channelID"]),

            ];
        }
        return $data;
    }

    public function addChannel(array $data)
    {
        $roomData = [];
        $builder = $this->db->table('channels');
        $roomData = [
            "_channelID"  => $data['_channelID'],
            "channelName"        => $data['channelName'],
            "channelTopic"       => $data['channelTopic'],
            "channelDescription" => $data['channelDescription'],
            'createdBy'  => $data['createdBy'],
            "createdAt"  => $data['createdAt'],
            "status"      => 1
        ];

        $builder->set($roomData);
        $this->updateChannelMembers([
            "_channelID" => $data["_channelID"],
            "_uuid" => $data["createdBy"],
            "displayName" => $data["displayName"],
            "createdAt" => $data["createdAt"],
            "status" => 1,
        ]);
        $builder->insert();
        return $this->db->insertID();

    }

    public function updateChannelMembers(array $data)
    {
        $builder = $this->db->table('channel_members');
        if(isset($data["members"])) {
            $builder->delete(["_channelID" => $data["_channelID"]]);
            foreach($data["members"] as $result) {

                $member = [
                 "_channelID" => $data["_channelID"],
                 "createdAt"  => $data["createdAt"],
                 "_uuid"      => $result["_uuid"],
                 "displayName"  => $result["displayName"],
                 "status"     => 1,
                 "settings"  => json_encode($data["settings"])
        ];
                $builder->set($member);
                $builder->insert();
            }
        } else {
            $builder->set($data);
            $builder->insert();
        }
    }


    public function getChannelMembers(string $_channelID)
    {
        $data = [];
        $builder = $this->db->table('channel_members');
        $builder->select("channel_members._id, channel_members._channelID, channel_members._uuid, channel_members.displayName, channel_members.status, channel_members.createdAt, users.email");
        $builder->where([
           'channel_members._channelID' => $_channelID,
           'channel_members.status' => 1
        ]);
        $builder->join("users", "users._uuid = channel_members._uuid", "LEFT");
        $query = $builder->get();
        foreach($query->getResultArray() as $result) {
            $data[] = [
            "_uuid" => $result["_uuid"],
            "displayName" => $result["displayName"],
            "email" => $result["email"],
            "createdAt" => $result["createdAt"],
        ];
        }
        return $data;
    }

    public function updateChannel(array $data)
    {
        $builder = $this->db->table('channels');
        $builder->where("_channelID", $data["_channelID"]);
        $builder->set($data);
        $builder->set("updatedAt", Time::now()->toDateTimeString());
        $builder->update();
    }


    public function addChannelSettings(array $data)
    {
        $builder = $this->db->table('channel_members');
        $builder->where("_channelID", $data["_channelID"]);
        $builder->where("_uuid", $data["_uuid"]);
        $builder->set("settings", json_encode($data["setting"]));
        $builder->update();
    }

    public function archiveChannel(array $data)
    {
        $builder = $this->db->table('channels');
        $builder->where("_channelId", $data["_channelID"]);
        $builder->where("createdBy", $data["_uuid"]);
        $builder->set("status", 0);
        $builder->update();
    }

    public function addChannelMessage(array $data)
    {

        $builder = $this->db->table('channel_messages');
        if(isset($data["files"])) {
            $data["files"] = json_encode($data["files"]);
        }
        $builder->set($data);
        $builder->insert($data);
        return $this->insertID();
    }

    public function getChannelMessages(string $_channelId, ?int $limit = null, ?int $offset = null)
    {
        $data = [];
        $builder = $this->db->table('channel_messages');
        $builder->select("*");
        $builder->where('_channelId', $_channelId);
        $builder->orderBy("_id", "ASC");
        $builder->limit($limit, $offset);

        $query = $builder->get();
        foreach ($query->getResultArray() as $result) {
            $data[]  = [
                "_id" => $result["_id"],
                "_channelID" => $result["_channelID"],
                "from" => $result["from"],
                "fromName" => $result["fromName"],
                "content" => $result["content"],
                "updatedAt" => $result["updatedAt"],
                "editContent" => $result['editContent'],
                "createdAt" => $result["createdAt"],
                "reactions" => $this->getMessageRactions($result["_id"]),
                "thread" => $this->getMessageThread($result["_id"]),
                "files" => $result["files"] !== null ? $this->getChannelUploads($result["files"]) : null

            ];
        };


        return $data;
    }

    protected function getMessageRactions(int $_messageID)
    {
        $data = [];
        $builder = $this->db->table('channel_messages_reactions');
        $builder->select("*, COUNT(emoji) as total, GROUP_CONCAT(DISTINCT(displayName) SEPARATOR ', ') as displayName");
        $builder->where("_messageID", $_messageID)->groupBy("emoji");
        foreach($builder->get()->getResultArray() as $result) {
            $data[] = [
                "_messageID" => (int) $result["_messageID"],
                "emoji" => $result["emoji"],
                "total" => (int)$result["total"],
                "displayName" => $result["displayName"],
            ];
        }
        return $data;

    }

    public function updateMessageReaction(array $data)
    {
        $builder = $this->db->table("channel_messages_reactions");
        $builder->where([
            "_uuid" => $data["_uuid"],
            "emoji" => $data["emoji"],
            "_messageID" => $data["_messageID"],
        ]);
        if ($builder->get()->getRowArray()) {
            $builder->delete([
                "_uuid" => $data["_uuid"],
                "emoji" => $data["emoji"],
                "_messageID" => $data["_messageID"],
            ]);
        } else {
            $builder->set($data);
            $builder->insert();
            return $this->db->insertID();
        }
    }


    protected function getMessageThread(int $_messageID)
    {
        $builder = $this->db->table('channel_messages_thread');
        $builder->where("_messageID", $_messageID);
        return $builder->get()->getResultArray();

    }

    public function getTotalChannelMessages(string $_channelID)
    {
        $builder = $this->db->table('channel_messages');
        $builder->where("_channelID", $_channelID);
        return $builder->countAllResults();
    }


    public function deleteChannelMessage(array $message)
    {
        $builder = $this->db->table('channel_messages');
        $builder->delete(["_id" => $message["_id"]]);
    }

    public function addChannelMessageThread(array $data)
    {
        $builder = $this->db->table('channel_messagesThread');
        if(isset($data["files"])) {
            $builder->set("files", json_encode($data["files"]));
        }

        $builder->set($data);
        $builder->insert();
        return $this->insertID();
    }

    public function leaveChannel(array $data)
    {
        $builder = $this->db->table('channel_members');
        $builder->where(["_channelID" => $data["_channelID"], "_uuid" => $data["_uuid"]]);
        $builder->set("updatedAt", Time::now()->toDateTimeString());
        $builder->set("status", 0);
        $builder->update();
    }


    protected function getChannelUploads(string|array $_id)
    {
        $data = [];
        $builder = $this->db->table('channel_messages_files');
        $builder->select();
        $builder->whereIn('_id', json_decode($_id, true));
        $query = $builder->get();
        return $query->getResultArray();
    }


    public function upload(array $data)
    {
        $builder = $this->db->table("channel_messages_files");
        $builder->set($data);
        $builder->insert();
        return $this->db->insertID();
    }


    public function updateChannelMessage(array $message)
    {
        $builder = $this->db->table('channel_messages');
        $builder->where("_id", $message["_id"]);
        $data = [
            'content' => $message["content"],
            'editContent' => $message["editContent"],
            'updatedAt' => $message["updatedAt"],
        ];
        $builder->set($data);
        $builder->update();
    }

}
