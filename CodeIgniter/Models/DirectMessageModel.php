<?php

namespace App\Models;

use CodeIgniter\Model;
use CodeIgniter\Database\RawSql;
use CodeIgniter\I18n\Time;

class DirectMessageModel extends Model
{
    protected $table = "users";
    protected $primaryKey = "_id";

    protected $useAutoIncrement = true;

    protected $returnType = "array";
    protected $useSoftDeletes = true;

    protected $allowedFields = [];

    // Dates
    protected $useTimestamps = true;
    protected $dateFormat = "datetime";
    protected $createdField = "createdAt";
    protected $updatedField = "updatedAt";
    protected $deletedField = "deletedAt";

    // Callbacks
    protected $allowCallbacks = false;
    protected $beforeInsert = [];
    protected $afterInsert = [];
    protected $beforeUpdate = [];
    protected $afterUpdate = [];
    protected $beforeFind = [];
    protected $afterFind = [];
    protected $beforeDelete = [];
    protected $afterDelete = [];

    public function addDirectMessage(array $data)
    {
        $builder = $this->db->table("direct_messages");
        if (isset($data["files"])) {
            $data["files"] = json_encode($data["files"]);
        }
        $builder->set($data);
        $builder->insert();
        return $this->insertID();
    }

    public function addDirectMessageThread(array $data)
    {
        $builder = $this->db->table("direct_messages_thread");
        $builder->set($data);
        $builder->insert();
        return $this->insertID();
    }

    public function deleteMessage(array $message)
    {
        $builder = $this->db->table("direct_messages");
        $builder->delete(["_id" => $message["_id"]]);
    }

    public function updateMessage(array $message)
    {
        $builder = $this->db->table("direct_messages");
        $builder->where("_id", $message["_id"]);
        $data = [
            "content" => $message["content"],
            "editContent" => $message["editContent"],
            "updatedAt" => $message["updatedAt"],
        ];
        $builder->set($data);
        $builder->update();
    }

    public function getUserDirectMessages(
        string $_channelID,
        ?int $limit = null,
        ?int $offset = null
    ) {
        $data = [];
        $builder = $this->db->table("direct_messages");
        $builder->distinct("*");
        $builder->where("_channelID", $_channelID);
        $builder->orderBy("_id", "ASC");
        $builder->limit($limit, $offset);
        $query = $builder->get();
        foreach ($query->getResultArray() as $result) {
            $data[] = [
                "_id" => (int) $result["_id"],
                "_channelID" => $result["_channelID"],
                "from" => $result["from"],
                "to" => $result["to"],
                "content" => $result["content"],
                "updatedAt" => $result["updatedAt"],
                "editContent" => $result["editContent"],
                "createdAt" => $result["createdAt"],
                "seen" => $result["seen"] === 1 ? true : false,
                "thread" => $this->getMessageThread($result["_id"]),
                "reactions" => $this->getMessageRactions($result["_id"]),
                "files" =>
                    $result["files"] !== null
                        ? $this->getuploads($result["files"])
                        : null,
            ];
        }
        return $data;
    }

    public function getMessageThread(int $_messageID)
    {
        $builder = $this->db->table("direct_messages_thread");
        $builder->where("_messageID", $_messageID);
        return $builder->get()->getResultArray();
    }

    protected function getMessageRactions(int $_messageID)
    {
        $data = [];
        $builder = $this->db->table("direct_messages_reactions");
        $builder->select(
            "*, COUNT(_messageID) as total, GROUP_CONCAT(DISTINCT(displayName) SEPARATOR ', ') as displayName"
        );
        $builder->where("_messageID", $_messageID)->groupBy("emoji");
        foreach ($builder->get()->getResultArray() as $result) {
            $data[] = [
                "_id" => (int) $result["_id"],
                "_messageID" => (int) $result["_messageID"],
                "emoji" => $result["emoji"],
                "total" => (int) $result["total"],
                "displayName" => $result["displayName"],
            ];
        }
        return $data;
    }

    public function updateMessageReaction(array $data)
    {
        $builder = $this->db->table("direct_messages_reactions");
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

    protected function getUploads(string|array $_id)
    {
        $data = [];
        $builder = $this->db->table("direct_messages_files");
        $builder->select();
        $builder->whereIn("_id", json_decode($_id, true));
        $query = $builder->get();
        return $query->getResultArray();
    }

    public function addDirectMessagesMembers(array $data)
    {
        $builder = $this->db->table("direct_messages_channels");
        $builder->set($data);
        $builder->insert();
    }

    public function getUserDirectMessageChannels(string $_uuid)
    {
        $builder = $this->db->table("direct_messages_channels");
        $builder->where("from", $_uuid);
        $builder->orWhere("to", $_uuid);
        $query = $builder->get();
        return $query->getResultArray();
    }

    public function getUserTotalMessages(string $_channelID)
    {
        $builder = $this->db->table("direct_messages");
        $builder->where("_channelID", $_channelID);
        return $builder->countAllResults();
    }

    public function upload(array $data)
    {
        $builder = $this->db->table("direct_messages_files");
        $builder->set($data);
        $builder->insert();
        return $this->db->insertID();
    }

    public function removeFile(array $data)
    {
        $builder = $this->db->table("direct_messages_files");
        $direct_messages = $this->db->table("direct_messages");
        $direct_messages->where([
            "_id" => $data["messageID"],
        ]);
        $query = $direct_messages->get();
        if ($row = $query->getRowArray()) {
            $files = json_decode($row["files"]);
            if (count($files) > 1) {
                $index = array_search($data["fileID"], $files);
                if ($index !== false) {
                    unset($files[$index]);
                }
                $direct_messages->where("_id", $data["messageID"]);
                $direct_messages
                    ->set(["files" => json_encode($files)])
                    ->update();
                return;
            } elseif ($row["content"] === "") {
                $direct_messages->where("_id", $data["messageID"]);
                $direct_messages->delete();
            } else {
                $row["files"] = null;
            }
        }
    }
}
