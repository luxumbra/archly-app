<?php

namespace App\Services;

class AddressService {
    public function getPostalTown($addressComponents) {
        if (empty($addressComponents) || !is_array($addressComponents)) {
            return 'Unknown location';
        }

        foreach ($addressComponents as $addressComponent) {
            if (isset($addressComponent['types']) && in_array('postal_town', $addressComponent['types'])) {
                return $addressComponent['longText'];
            }
        }
        return 'Unknown location';
    }
}
