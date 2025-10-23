package azship.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

import java.util.Map;

@Getter
@Setter
public class FreightDTO {

    private Long id;

    @NotBlank(message = "O nome do cliente não pode estar em branco")
    private String clientName;

    @NotBlank(message = "O status não pode estar em branco")
    private String status;

    private Map<String, Object> properties;
}