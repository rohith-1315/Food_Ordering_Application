package com.foodapp.service;

import com.foodapp.dto.request.AddressRequest;
import com.foodapp.dto.response.AddressResponse;
import com.foodapp.exception.ResourceNotFoundException;
import com.foodapp.exception.UnauthorizedException;
import com.foodapp.exception.ValidationException;
import com.foodapp.model.Address;
import com.foodapp.model.User;
import com.foodapp.repository.AddressRepository;
import com.foodapp.repository.UserRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AddressService {

    private static final int MAX_ADDRESSES_PER_USER = 5;

    private final AddressRepository addressRepository;
    private final UserRepository userRepository;

    @Transactional
    public AddressResponse createAddress(String userEmail, AddressRequest request) {
        User user = getUserByEmail(userEmail);

        long existingCount = addressRepository.countByUser(user);
        if (existingCount >= MAX_ADDRESSES_PER_USER) {
            throw new ValidationException("You can save up to 5 addresses only");
        }

        List<Address> existingAddresses = addressRepository.findByUser(user);

        Address address = new Address();
        address.setUser(user);
        mapRequestToAddress(request, address);

        boolean shouldSetDefault = request.isDefault() || existingAddresses.isEmpty();
        if (shouldSetDefault) {
            unsetDefaultForUserAddresses(existingAddresses);
            address.setDefault(true);
        }

        return mapToResponse(addressRepository.save(address));
    }

    @Transactional(readOnly = true)
    public List<AddressResponse> getMyAddresses(String userEmail) {
        User user = getUserByEmail(userEmail);
        return addressRepository.findByUserOrderByIsDefaultDescCreatedAtDesc(user).stream()
            .map(this::mapToResponse)
            .toList();
    }

    @Transactional
    public AddressResponse updateAddress(String userEmail, Long addressId, AddressRequest request) {
        User user = getUserByEmail(userEmail);

        Address address = addressRepository.findByIdAndUser(addressId, user)
            .orElseThrow(() -> new ResourceNotFoundException("Address not found with id: " + addressId));

        mapRequestToAddress(request, address);

        if (request.isDefault()) {
            List<Address> existingAddresses = addressRepository.findByUser(user);
            unsetDefaultForUserAddresses(existingAddresses);
            address.setDefault(true);
        }

        return mapToResponse(addressRepository.save(address));
    }

    @Transactional
    public void deleteAddress(String userEmail, Long addressId) {
        User user = getUserByEmail(userEmail);

        Address address = addressRepository.findByIdAndUser(addressId, user)
            .orElseThrow(() -> new ResourceNotFoundException("Address not found with id: " + addressId));

        List<Address> allAddresses = addressRepository.findByUser(user);

        if (address.isDefault() && allAddresses.size() == 1) {
            throw new ValidationException("Cannot delete your only default address");
        }

        addressRepository.delete(address);

        if (address.isDefault()) {
            List<Address> remaining = addressRepository.findByUserOrderByIsDefaultDescCreatedAtDesc(user);
            if (!remaining.isEmpty() && remaining.stream().noneMatch(Address::isDefault)) {
                Address nextDefault = remaining.get(0);
                nextDefault.setDefault(true);
                addressRepository.save(nextDefault);
            }
        }
    }

    @Transactional
    public AddressResponse setDefaultAddress(String userEmail, Long addressId) {
        User user = getUserByEmail(userEmail);
        Address address = addressRepository.findByIdAndUser(addressId, user)
            .orElseThrow(() -> new ResourceNotFoundException("Address not found with id: " + addressId));

        List<Address> addresses = addressRepository.findByUser(user);
        unsetDefaultForUserAddresses(addresses);

        address.setDefault(true);
        return mapToResponse(addressRepository.save(address));
    }

    private void unsetDefaultForUserAddresses(List<Address> addresses) {
        for (Address existing : addresses) {
            if (existing.isDefault()) {
                existing.setDefault(false);
                addressRepository.save(existing);
            }
        }
    }

    private void mapRequestToAddress(AddressRequest request, Address address) {
        address.setLabel(request.getLabel().trim());
        address.setStreet(request.getStreet().trim());
        address.setCity(request.getCity().trim());
        address.setZipcode(request.getZipcode().trim());
        address.setPhone(request.getPhone().trim());
    }

    private AddressResponse mapToResponse(Address address) {
        return new AddressResponse(
            address.getId(),
            address.getLabel(),
            address.getStreet(),
            address.getCity(),
            address.getZipcode(),
            address.getPhone(),
            address.isDefault());
    }

    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
            .orElseThrow(() -> new UnauthorizedException("User not found"));
    }
}
