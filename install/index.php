<?php

use Bitrix\Main\EventManager;
use Bitrix\Main\Loader;
use Bitrix\Main\LoaderException;
use Bitrix\Main\Localization\Loc;
use Bitrix\Main\ModuleManager;

Loc::loadMessages(__FILE__);

class loodsen_webpack extends CModule
{
    private string $moduleDirAdmin = __DIR__ . '/admin';

    public function __construct()
    {
        if (file_exists(__DIR__ . "/version.php")) {

            $arModuleVersion = [];

            include_once(__DIR__ . "/version.php");

            $this->MODULE_ID = str_replace("_", ".", get_class($this));
            $this->MODULE_VERSION = $arModuleVersion["VERSION"];
            $this->MODULE_VERSION_DATE = $arModuleVersion["VERSION_DATE"];
            $this->MODULE_NAME = Loc::getMessage("LOODSEN_WEBPACK_NAME");
            $this->MODULE_DESCRIPTION = Loc::getMessage("LOODSEN_WEBPACK_DESCRIPTION");
            $this->PARTNER_NAME = Loc::getMessage("LOODSEN_WEBPACK_PARTNER_NAME");
            $this->PARTNER_URI = Loc::getMessage("LOODSEN_WEBPACK_PARTNER_URI");

        }
    }


    public function DoInstall(): bool
    {
        ModuleManager::registerModule($this->MODULE_ID);
        $this->InstallEvents();
        return true;
    }


    public function DoUninstall(): bool
    {
        $this->UnInstallEvents();
        ModuleManager::unRegisterModule($this->MODULE_ID);
        return true;
    }


    public function InstallDB(): bool
    {
        return true;
    }


    public function UnInstallDB(): bool
    {
        return true;
    }


    public function InstallEvents(): bool
    {
        $eventManager =  EventManager::getInstance();
        $eventManager->registerEventHandler('main','OnProlog','loodsen.webpack','\\Loodsen\\Webpack\\Loader','includeAll');
        return true;
    }


    public function UnInstallEvents(): bool
    {
        $eventManager =  EventManager::getInstance();
        $eventManager->unRegisterEventHandler('main','OnProlog','loodsen.webpack','\\Loodsen\\Webpack\\Loader','includeAll');
        return true;
    }


    public function InstallFiles(): bool
    {
        $moduleDirAdmin = $this->moduleDirAdmin;

        if (file_exists($moduleDirAdmin)) {
            CopyDirFiles($moduleDirAdmin, $_SERVER["DOCUMENT_ROOT"] . "/bitrix/admin");
        }

        return true;
    }


    public function UnInstallFiles(): bool
    {
        $moduleDirAdmin = $this->moduleDirAdmin;

        if (file_exists($moduleDirAdmin)) {
            DeleteDirFiles($moduleDirAdmin, $_SERVER["DOCUMENT_ROOT"] . "/bitrix/admin");
        }
        return true;
    }

}
