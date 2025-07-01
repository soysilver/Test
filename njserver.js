#include <stdio.h>
#include <stdlib.h>
#include "libsohre.h"


char* read_file_to_string(const char *filename) {
    FILE *f = fopen(filename, "rb");
    if (!f) return NULL;

    fseek(f, 0, SEEK_END);
    long size = ftell(f);
    fseek(f, 0, SEEK_SET);

    char *buffer = malloc(size + 1);
    if (!buffer) {
        fclose(f);
        return NULL;
    }

    fread(buffer, 1, size, f);
    buffer[size] = '\0';
    fclose(f);
    return buffer;
}

int main() {
    char *json_input = read_file_to_string("os-ctrl.json");
    if (!json_input) {
        fprintf(stderr, "Failed to read JSON file\n");
        return 1;
    }

    diag_sohre_t *diag_sohre[12];
    for (int i = 0; i < 12; i++) {
        diag_sohre[i] = calloc(1, sizeof(diag_sohre_t));
        if (!diag_sohre[i]) {
            fprintf(stderr, "Memory allocation failed\n");
            return 1;
        }
    }

    int ret = run_sohre(json_input, diag_sohre);
    if (ret != 0) {
        fprintf(stderr, "libsohre analysis failed\n");
        free(json_input);
        return 1;
    }

    printf("libsohre analysis success\n");

    for (int i = 0; i < 12; i++) {
        printf("Axis %d - alarm: %.2f, rpm: %.2f\n", i + 1, diag_sohre[i]->alarm, diag_sohre[i]->rpm);

        free(diag_sohre[i]);
    }

    free(json_input);
    return 0;
}

