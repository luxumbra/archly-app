<?php

namespace App\Services;

class AddressService {
    public function getPostalTown($addressComponents) {
        foreach ($addressComponents as $addressComponent) {
            if (in_array('postal_town', $addressComponent['types'])) {
                return $addressComponent['longText'];
            }
        }
        return null;
    }
}
