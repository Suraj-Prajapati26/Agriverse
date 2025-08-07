package com.agriverse.usernotification.model;

import java.time.LocalDateTime;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {
	@Id
	@GeneratedValue(strategy= GenerationType.IDENTITY)
	private Long userId;
	
	@Column(nullable=false)
	private String name;
	@Column(nullable=false)
	private String email;
	private String phone;
	@Column(nullable=false)
	private String passwordHash;
	@Enumerated(EnumType.STRING)
	private Role role;
	private String location;
	private LocalDateTime createdAt;
	@PrePersist
	protected void onCreate() {
		createdAt = LocalDateTime.now();
	}
	
	public enum Role{
		Farmer,Admin,Advisor
	}
}
