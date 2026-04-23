package com.foodapp.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AddressResponse {

    private Long id;
    private String label;
    private String street;
    private String city;
    private String zipcode;
    private String phone;
    private boolean isDefault;
}
