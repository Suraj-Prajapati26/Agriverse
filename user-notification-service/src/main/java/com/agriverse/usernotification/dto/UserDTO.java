package com.agriverse.usernotification.dto;

import com.agriverse.usernotification.model.User;

import lombok.Data;

@Data
public class UserDTO {
    private String name;
    private String email;
    private String phone;
    private String password;
    private User.Role role;
    private String location;
}
