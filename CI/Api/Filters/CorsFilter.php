<?php

namespace App\Filters;

use config\Services;
use CodeIgniter\HTTP\RequestInterface;
use CodeIgniter\HTTP\Response;
use CodeIgniter\HTTP\ResponseInterface;
use CodeIgniter\Filters\FilterInterface;

class CorsFilter implements FilterInterface
{
    public function before(RequestInterface $request, $arguments = null)
    {
        // if (!$request instanceof IncomingRequest) {
        //     return;
        // }
        $response = Services::response();

        $authenticationHeader = $request->getServer("AUTHORIZATION");

        if (array_key_exists("HTTP_ORIGIN", $request->getServer())) {
            $origin = $request->getServer("HTTP_ORIGIN");
        } elseif (array_key_exists("HTTP_REFERER", $request->getServer())) {
            $origin = $request->getServer("HTTP_REFERER");
        } else {
            $origin = $request->getServer("REMOTE_ADDR");
        }
        //var_dump($origin);
        $allowedDomains = [
            "http://localhost:5173",
            "http://localhost:5174",
            "http://localhost:5175",
            "http://localhost:4567"
        ];

        if (in_array($origin, $allowedDomains)) {
            $response->setHeader(
                "Access-Control-Allow-Origin",
                $origin
            );
        }

        $response->setHeader(
            "Access-Control-Allow-Headers",
            "Origin, X-API-KEY, X-Requested-With, Content-Type, Accept, Access-Control-Request-Method, Access-Control-Allow-Headers, Authorization, observe, enctype, Content-Length, X-Csrf-Token"
        )
        ->setHeader("Access-Control-Allow-Methods", "PUT, GET, POST, DELETE, OPTIONS")
        ->setHeader("Access-Control-Max-Age", "3600")->setHeader("content-type", "application/json; charset=utf-8");
    }

    public function after(RequestInterface $request, ResponseInterface $response, $arguments = null)
    {

        $authenticationHeader = $request->getServer("AUTHORIZATION");

        if (array_key_exists("HTTP_ORIGIN", $request->getServer())) {
            $origin = $request->getServer("HTTP_ORIGIN");
        } elseif (array_key_exists("HTTP_REFERER", $request->getServer())) {
            $origin = $request->getServer("HTTP_REFERER");
        } else {
            $origin = $request->getServer("REMOTE_ADDR");
        }
        //var_dump($origin);
        $allowedDomains = [
            "http://localhost:5173",
            "http://localhost:5174",
            "http://localhost:5175",
            "http://localhost:4567"
        ];

        if (in_array($origin, $allowedDomains)) {
            $response->setHeader(
                "Access-Control-Allow-Origin",
                $origin
            );
        }

        $response->setHeader(
            "Access-Control-Allow-Headers",
            "Origin, X-API-KEY, X-Requested-With, Content-Type, Accept, Access-Control-Request-Method, Access-Control-Allow-Headers, Authorization, observe, enctype, Content-Length, X-Csrf-Token"
        )
        ->setHeader("Access-Control-Allow-Methods", "PUT, GET, POST, DELETE, OPTIONS")
        ->setHeader("Access-Control-Max-Age", "3600")->setHeader("content-type", "application/json; charset=utf-8");
        //->setHeader("Access-Control-Allow-Credentials", "true")
        // ->setHeader("content-type", "application/octet-stream");
        //var_dump($request->getMethod(true));
        // if ($request->getMethod(true) == "OPTIONS") {
        //     $response->setHeader("HTTP/1.1 200 OK CORS");
        //     // die();
        // }
    }
}
