<?php

namespace Loodsen\Webpack;

use Bitrix\Crm\Kanban\Exception;
use Bitrix\Main\Page\Asset;
use RecursiveDirectoryIterator;

class Loader
{

    /**
     * @var string[]
     */
    private $searchPaths = [
        'runtime' => "local/modules/loodsen.webpack/build/js/runtime/",
        'vendors' => "local/modules/loodsen.webpack/build/js/vendor/",
        'shared' => "local/modules/loodsen.webpack/build/js/shared/"
    ];

    /** @var bool */
    private static $loaded = false;

    /** @var array */
    private static $jsPaths = [];

    public function __construct()
    {
        $this->loadPaths();
    }

    private function loadPaths(): void
    {
        if (!self::$loaded) {
            self::$jsPaths = $this->findWebpackFiles();
            self::$loaded = true;
        }
    }

    private function findWebpackFiles(): array
    {
        $jsPaths = [];
        foreach ($this->searchPaths as $type => $path) {
            try {
                $it = new RecursiveDirectoryIterator($_SERVER['DOCUMENT_ROOT'] . '/' . $path);
                foreach (new \RecursiveIteratorIterator($it) as $file) {
                    if (array_pop(explode('.', $file)) === 'js') {
                        $jsPaths[$type][] = str_replace($_SERVER['DOCUMENT_ROOT'], "", $file->getPathName());
                    }
                }
            } catch (\Exception $exception){

            }
    }
        return $jsPaths;
    }

    public function includeRuntime(): void
    {
        $this->includeAssets("runtime");
    }

    public function includeVendors(): void
    {
        $this->includeAssets("vendors");
    }

    public function includeShared(): void
    {
        $this->includeAssets("shared");
    }

    public function includeCss():void
    {
        Asset::getInstance()->addCss('/local/modules/loodsen.webpack/build/css/style.css');
    }

    private function includeAssets($type)
    {
        foreach (self::$jsPaths[$type] as $path) {
            Asset::getInstance()->addJs($path);
        }
    }

    public static function includeAll(){
        $loader = new self();
        $loader->includeRuntime();
        $loader->includeVendors();
        $loader->includeShared();
        $loader->includeCss();
    }
}
